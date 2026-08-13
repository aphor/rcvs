import { useState } from 'react'
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
import { getBeer, breweryCount } from '../data/beers.js'
import BallotCard from './BallotCard.jsx'
import ConfirmModal from './ConfirmModal.jsx'

export default function Ballot({ onBrowse }) {
  const { state, promote, demote, removeBeer, reorder, castBallot } = useApp()
  const cast = state.ballotCast

  // modal is null | { type: 'remove', id } | { type: 'cast' }
  const [modal, setModal] = useState(null)

  // Touch needs a short press delay so vertical scrolling still works; pointer
  // (mouse) needs a small distance threshold so clicks aren't read as drags.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const from = state.ballot.indexOf(active.id)
    const to = state.ballot.indexOf(over.id)
    reorder(arrayMove(state.ballot, from, to))
  }

  const confirmModal = () => {
    if (!modal) return
    if (modal.type === 'remove') removeBeer(modal.id)
    if (modal.type === 'cast') castBallot()
    setModal(null)
  }

  const removingBeer = modal?.type === 'remove' ? getBeer(modal.id) : null

  return (
    <div className={cast ? 'ballot ballot-cast' : 'ballot'}>
      <button type="button" className="floating floating-top btn btn-secondary" onClick={onBrowse}>
        {cast ? 'BROWSE BEERS' : '← ADD MORE BEERS TO BALLOT'}
      </button>

      <div className="ballot-body">
        {cast && <p className="cast-banner">✓ Ballot cast — thanks for voting!</p>}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={state.ballot} strategy={verticalListSortingStrategy}>
            <div className="ballot-list">
              {state.ballot.map((id, i) => {
                const beer = getBeer(id)
                if (!beer) return null
                return (
                  <BallotCard
                    key={id}
                    beer={beer}
                    rank={i + 1}
                    total={state.ballot.length}
                    cutoff={breweryCount}
                    disabled={cast}
                    onPromote={() => promote(id)}
                    onDemote={() => demote(id)}
                    onRemove={() => setModal({ type: 'remove', id })}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {!cast && (
        <button
          type="button"
          className="floating floating-bottom btn btn-cast"
          onClick={() => setModal({ type: 'cast' })}
        >
          CAST BALLOT
        </button>
      )}

      <ConfirmModal
        open={modal?.type === 'remove'}
        title="Remove from ballot?"
        message={removingBeer ? `Remove “${removingBeer.name}” from your ballot?` : ''}
        confirmLabel="Remove"
        danger
        onConfirm={confirmModal}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={modal?.type === 'cast'}
        title="Cast your ballot?"
        message="Once cast, your ranking is final and can't be changed."
        confirmLabel="Cast ballot"
        onConfirm={confirmModal}
        onCancel={() => setModal(null)}
      />
    </div>
  )
}
