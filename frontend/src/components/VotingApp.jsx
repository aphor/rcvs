import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import BeerPicker from './BeerPicker.jsx'
import Ballot from './Ballot.jsx'
import VoteButton from './VoteButton.jsx'

export default function VotingApp() {
  const { state } = useApp()
  const [view, setView] = useState('picker') // 'picker' | 'ballot'

  return (
    <div className="screen app-screen">
      <header className="app-header compact">
        <h1>🍺 Favorite Beer Vote</h1>
        <p className="subtitle">Hi, {state.user?.firstname}! Tasted {state.ballot.length}</p>
      </header>

      {view === 'picker' ? (
        <>
          <BeerPicker />
          {state.ballot.length >= 1 && <VoteButton onClick={() => setView('ballot')} />}
        </>
      ) : (
        <Ballot onBrowse={() => setView('picker')} />
      )}
    </div>
  )
}
