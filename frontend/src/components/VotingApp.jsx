import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import BeerPicker from './BeerPicker.jsx'
import Ballot from './Ballot.jsx'
import VoteButton from './VoteButton.jsx'
import ConfirmModal from './ConfirmModal.jsx'

export default function VotingApp() {
  const { state, reset } = useApp()
  const [view, setView] = useState('picker') // 'picker' | 'ballot'
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="screen app-screen">
      <header className="app-header compact">
        <button type="button" className="start-over" onClick={() => setConfirmReset(true)}>
          Start over
        </button>
        <h1>🍺 Favorite Beer Vote</h1>
        <p className="subtitle">
          Hi, {state.user?.firstname}! Tasted {state.ballot.length}
        </p>
      </header>

      {view === 'picker' ? (
        <>
          <BeerPicker />
          {state.ballot.length >= 1 && <VoteButton onClick={() => setView('ballot')} />}
        </>
      ) : (
        <Ballot onBrowse={() => setView('picker')} />
      )}

      {/* Clearing the session drops registered=false, so the router returns to
          the introduction / instructions / registration flow. */}
      <ConfirmModal
        open={confirmReset}
        title="Start over?"
        message="This clears your registration, tasted beers, and ballot, and returns to the introduction."
        confirmLabel="Start over"
        danger
        onConfirm={() => {
          setConfirmReset(false)
          reset()
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
