import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useApp } from '../context/AppContext.jsx'
import { usePollStatus } from '../lib/usePollStatus.js'
import PollStatusBar from './PollStatusBar.jsx'
import { groupByBrewery } from '../data/beers.js'
import BreweryBallotCard from './BreweryBallotCard.jsx'
import FlavorBallot from './FlavorBallot.jsx'
import FeedbackCard from './FeedbackCard.jsx'
import ConfirmModal from './ConfirmModal.jsx'

// The ballot is a small pager of cards; the cast button unlocks only once every
// card has been viewed.
const CARDS = [
  { key: 'breweries', title: 'Rank the breweries you tasted' },
  { key: 'flavors', title: 'Rank flavor profiles' },
  { key: 'feedback', title: 'Questions & suggestions' },
]

export default function Ballot({ onBrowse }) {
  const { state, reorder, setFlavorRanks, setFeedback, castBallot } = useApp()
  const cast = state.ballotCast
  const poll = usePollStatus()

  // The ballot is stored as a flat list of beer ids — the shape the server
  // expects — and displayed as the breweries that list expresses. Every move
  // below reorders whole brewery groups and flattens back to beer ids, so the
  // stored ballot and the visible ranking never disagree.
  const groups = groupByBrewery(state.ballot)
  const flatten = (list) => list.flatMap((g) => g.beers.map((b) => b.id))
  const moveGroup = (slug, delta) => {
    const from = groups.findIndex((g) => g.slug === slug)
    const to = from + delta
    if (from < 0 || to < 0 || to >= groups.length) return
    reorder(flatten(arrayMove(groups, from, to)))
  }
  const dropGroup = (slug) => reorder(flatten(groups.filter((g) => g.slug !== slug)))

  const [card, setCard] = useState(0)
  const [viewed, setViewed] = useState(() => new Set([0]))
  const [modal, setModal] = useState(null) // null | { type: 'remove', slug } | { type: 'cast' }

  const go = (index) => {
    if (index < 0 || index >= CARDS.length) return
    setCard(index)
    setViewed((prev) => (prev.has(index) ? prev : new Set(prev).add(index)))
  }
  const allViewed = viewed.size === CARDS.length

  // Touch needs a short press delay so vertical scrolling still works; pointer
  // (mouse) needs a small distance threshold so clicks aren't read as drags.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const from = groups.findIndex((g) => g.slug === active.id)
    const to = groups.findIndex((g) => g.slug === over.id)
    if (from < 0 || to < 0) return
    reorder(flatten(arrayMove(groups, from, to)))
  }

  const confirmModal = () => {
    if (!modal) return
    if (modal.type === 'remove') dropGroup(modal.slug)
    if (modal.type === 'cast') castBallot().then(poll.refresh)
    setModal(null)
  }

  const removing = modal?.type === 'remove' ? groups.find((g) => g.slug === modal.slug) : null

  return (
    <div className={cast ? 'ballot ballot-cast' : 'ballot'}>
      <div className="ballot-progress floating floating-top">
        Card {card + 1} of {CARDS.length}: {CARDS[card].title}
      </div>

      <div className="ballot-body">
        <PollStatusBar
          status={poll.status}
          scheduledOp={poll.scheduledOp}
          msRemaining={poll.msRemaining}
        />

        {cast && <p className="cast-banner">✓ Ballot cast — thanks for voting!</p>}

        {!cast && state.castError === 'polls_not_open' && (
          <p className="cast-error">
            Your ballot was <strong>not</strong> accepted: voting{' '}
            {poll.status === 'closed' ? 'has closed' : 'has not opened yet'}. Your rankings are still
            here — cast again once voting is open.{' '}
            <Link to="/results">See the results →</Link>
          </p>
        )}
        {!cast && state.castError === 'unreachable' && (
          <p className="cast-error">
            Your ballot was <strong>not</strong> accepted: the server could not be reached. Your
            rankings are still here — try again in a moment.
          </p>
        )}

        {card === 0 && (
          <>
            <button type="button" className="btn btn-secondary browse-btn" onClick={onBrowse}>
              {cast ? 'BROWSE BEERS' : '← ADD MORE BEERS TO BALLOT'}
            </button>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={groups.map((g) => g.slug)}
                strategy={verticalListSortingStrategy}
              >
                <div className="ballot-list">
                  {groups.map((group, i) => (
                    <BreweryBallotCard
                      key={group.slug}
                      group={group}
                      rank={i + 1}
                      total={groups.length}
                      disabled={cast}
                      onPromote={() => moveGroup(group.slug, -1)}
                      onDemote={() => moveGroup(group.slug, 1)}
                      onRemove={() => setModal({ type: 'remove', slug: group.slug })}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}

        {card === 1 && (
          <FlavorBallot ranks={state.flavorRanks} onChange={setFlavorRanks} disabled={cast} />
        )}

        {card === 2 && (
          <FeedbackCard feedback={state.feedback} onChange={setFeedback} disabled={cast} />
        )}

        {!cast && !allViewed && (
          <p className="cast-hint">Preview all ballot cards to enable casting.</p>
        )}
      </div>

      <div className="ballot-nav floating floating-bottom">
        <button
          type="button"
          className="btn btn-ghost nav-btn"
          onClick={() => go(card - 1)}
          disabled={card === 0}
        >
          ‹ Prev
        </button>
        <button
          type="button"
          className="btn btn-cast"
          onClick={() => setModal({ type: 'cast' })}
          disabled={cast || !allViewed || (poll.status !== null && !poll.isOpen)}
          title={
            !allViewed
              ? 'Preview all ballot cards first'
              : poll.status && !poll.isOpen
                ? 'Voting is not open'
                : undefined
          }
        >
          CAST BALLOT
        </button>
        <button
          type="button"
          className="btn btn-ghost nav-btn"
          onClick={() => go(card + 1)}
          disabled={card === CARDS.length - 1}
        >
          Next ›
        </button>
      </div>

      <ConfirmModal
        open={modal?.type === 'remove'}
        title="Remove from ballot?"
        message={
          removing
            ? `Remove “${removing.brewery}” from your ballot? This drops ${removing.beers
                .map((b) => b.name)
                .join(', ')}.`
            : ''
        }
        confirmLabel="Remove"
        danger
        onConfirm={confirmModal}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={modal?.type === 'cast'}
        title="Cast your ballot?"
        message="Once cast, your rankings are final and can't be changed."
        confirmLabel="Cast ballot"
        onConfirm={confirmModal}
        onCancel={() => setModal(null)}
      />
    </div>
  )
}
