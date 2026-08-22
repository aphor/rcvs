import { useState } from 'react'
import RegistrationForm from './RegistrationForm.jsx'

// Pre-registration intro: two informational cards (About, Instructions) that the
// taster pages through before the registration form. Suggested copy below —
// meant to be edited by the organizer.
const INTRO = [
  {
    key: 'about',
    title: 'About this election',
    body: (
      <>
        <p>
          Welcome to the <strong>Oak Park Microbrew Review 2026</strong> Ranked Choice Favorite Beer Vote.
        </p>
        <p>
          This is a <strong>ranked-choice election</strong>: participating brewers have nominated a beer
	  to represent them. You rank the candidates in the order of your preference for their beers.
	  This is designed to give you a feel for how ranked choice voting works. You can move the choices
	  up and down in the list to reflect your preference from top to bottom.
        </p>
        <p>
          The ballot also provides a choice to rank broad <strong>flavor profiles</strong> and to share any
          questions or suggestions. For this, fill in one circle per flavor per ranking, as you would
          fill in circles on a political election ballot form.
        </p>
        <p>
          This election is conducted by <strong>FairVote Illinois</strong> to showcase ranked-choice voting in a
          fun, low-stakes setting. Voting is open shortly after the start of the festival, with results available
	  afterwards here or by email if you provide valid contact information at registration.
        </p>
	<p>
	  Results will be counted for favorite brewery and beer flavor profile by <strong>instant-runoff</strong>
	  by multiple rounds until an absolute majority winner is counted, or until all next-choice preferences
	  from the prior round have been exhausted (wouldn't change the outcome).
	</p>
        <p>
          FairVote promises to respect your privacy, and will not share your contact information with anyone
          except to respond to your comments or questions if you tell us you would like to be contacted.
        </p>
      </>
    ),
  },
  {
    key: 'instructions',
    title: 'Instructions',
    body: (
      <>
        <p>Voting takes just a few minutes:</p>
        <ol className="intro-steps">
          <li>
            <strong>Register</strong> with your name and contact info. Contact details are optional —
            see the note on the registration screen.
          </li>
          <li>
            <strong>Taste &amp; collect.</strong> Search the beer list and tap <em>Taste</em> on each
            beer you try; it&rsquo;s added to your ballot.
          </li>
          <li>
            <strong>Rank your beers.</strong> Open your ballot and order them best-to-worst with the
            up/down arrows or by dragging.
          </li>
          <li>
            <strong>Rank flavor profiles.</strong> On the grid ballot, mark one box per row to rank
            the flavors — each rank used once.
          </li>
          <li>
            <strong>Questions &amp; suggestions.</strong> Leave feedback and opt in if you&rsquo;d
            like someone to follow up.
          </li>
          <li>
            <strong>Review &amp; cast.</strong> Page through all ballot cards, then tap{' '}
            <em>Cast Ballot</em>. Once cast, your ballot is final.
          </li>
        </ol>
      </>
    ),
  },
]

export default function Welcome() {
  const [step, setStep] = useState(0) // 0=About, 1=Instructions, 2+=registration

  if (step >= INTRO.length) return <RegistrationForm />

  const card = INTRO[step]
  const last = step === INTRO.length - 1

  return (
    <div className="screen">
      <header className="app-header">
        <h1>🍺 Favorite Beer Vote</h1>
        <p className="subtitle">Oak Park Microbrew Review 2026</p>
      </header>

      <div className="card intro-card">
        <h2>{card.title}</h2>
        {card.body}
      </div>

      <div className="intro-nav">
        {step > 0 ? (
          <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
            ‹ Back
          </button>
        ) : (
          <span />
        )}
        <span className="intro-dots" aria-hidden="true">
          {INTRO.map((c, i) => (
            <span key={c.key} className={i === step ? 'dot active' : 'dot'} />
          ))}
        </span>
        <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
          {last ? 'Register →' : 'Next ›'}
        </button>
      </div>
    </div>
  )
}
