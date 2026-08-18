import { FLAVORS } from '../data/beers.js'

const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

// Grid-style paper ballot: flavor candidates in rows, ranks in columns of radio
// buttons. Selecting a cell enforces a single ranking per candidate by clearing
// any prior selection in the same ROW (that flavor's old rank) and the same
// COLUMN (whatever flavor held that rank). Clicking a selected cell clears it.
export default function FlavorBallot({ ranks, onChange, disabled }) {
  const cols = FLAVORS.map((_, i) => i + 1) // one rank column per flavor

  const select = (flavor, rank) => {
    if (disabled) return
    const next = { ...ranks }
    if (next[flavor] === rank) {
      delete next[flavor] // re-click clears
    } else {
      for (const f of Object.keys(next)) if (next[f] === rank) delete next[f] // column
      next[flavor] = rank // row (overwrites this flavor's previous rank)
    }
    onChange(next)
  }

  return (
    <div className="flavor-ballot">
      <p className="flavor-ballot-instructions">
        Rank the flavor profiles you enjoy — one box per row, each rank used once.
      </p>
      <div className="grid-scroll">
        <table className="flavor-grid">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Flavor</span>
              </th>
              {cols.map((r) => (
                <th key={r} scope="col">
                  {ORDINAL[r - 1]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FLAVORS.map((flavor) => (
              <tr key={flavor}>
                <th scope="row" className="flavor-row-label">
                  <span className={`flavor-pill flavor-${flavor.toLowerCase()}`}>{flavor}</span>
                </th>
                {cols.map((r) => (
                  <td key={r}>
                    <input
                      type="radio"
                      className="grid-radio"
                      name={`flavor-${flavor}`}
                      checked={ranks[flavor] === r}
                      onChange={() => {}}
                      onClick={() => select(flavor, r)}
                      disabled={disabled}
                      aria-label={`${flavor}: ${ORDINAL[r - 1]} choice`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
