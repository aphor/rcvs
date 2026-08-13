import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { loadSession, saveSession, clearSession, emptySession } from '../lib/session.js'

const AppContext = createContext(null)

// Move the item at `index` by `delta` positions, clamped to the array bounds.
function move(list, index, delta) {
  const target = index + delta
  if (index < 0 || target < 0 || target >= list.length) return list
  const next = list.slice()
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

function reducer(state, action) {
  switch (action.type) {
    case 'REGISTER':
      return { ...state, user: action.user }

    case 'PICK_BEER': {
      // Newest pick goes to the top of the ballot (reverse pick order).
      if (state.ballotCast) return state
      if (state.ballot.includes(action.id)) return state
      return { ...state, ballot: [action.id, ...state.ballot] }
    }

    case 'REMOVE_BEER':
      if (state.ballotCast) return state
      return { ...state, ballot: state.ballot.filter((id) => id !== action.id) }

    case 'PROMOTE': {
      if (state.ballotCast) return state
      const i = state.ballot.indexOf(action.id)
      return { ...state, ballot: move(state.ballot, i, -1) }
    }

    case 'DEMOTE': {
      if (state.ballotCast) return state
      const i = state.ballot.indexOf(action.id)
      return { ...state, ballot: move(state.ballot, i, 1) }
    }

    case 'REORDER': // full reorder from drag-and-drop
      if (state.ballotCast) return state
      return { ...state, ballot: action.ballot }

    case 'CAST_BALLOT':
      if (state.ballot.length === 0) return state
      return { ...state, ballotCast: true }

    case 'RESET':
      return emptySession()

    default:
      return state
  }
}

export function AppProvider({ children }) {
  // Lazy init straight from the mock session cookie so a reload restores state.
  const [state, dispatch] = useReducer(reducer, null, loadSession)

  useEffect(() => {
    saveSession(state)
  }, [state])

  const value = useMemo(() => {
    const actions = {
      register: (user) => dispatch({ type: 'REGISTER', user }),
      pickBeer: (id) => dispatch({ type: 'PICK_BEER', id }),
      removeBeer: (id) => dispatch({ type: 'REMOVE_BEER', id }),
      promote: (id) => dispatch({ type: 'PROMOTE', id }),
      demote: (id) => dispatch({ type: 'DEMOTE', id }),
      reorder: (ballot) => dispatch({ type: 'REORDER', ballot }),
      castBallot: () => dispatch({ type: 'CAST_BALLOT' }),
      reset: () => {
        clearSession()
        dispatch({ type: 'RESET' })
      },
    }
    return { state, ...actions }
  }, [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}
