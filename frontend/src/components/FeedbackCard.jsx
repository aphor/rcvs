// Third ballot card: free-text questions/suggestions plus an opt-in to be
// contacted. Persisted in the session and locked once the ballot is cast.
export default function FeedbackCard({ feedback, onChange, disabled }) {
  return (
    <div className="feedback-card">
      <label className="field">
        <span className="field-label">Questions and Suggestions</span>
        <textarea
          className="input feedback-text"
          rows={6}
          value={feedback.text}
          onChange={(e) => onChange({ ...feedback, text: e.target.value })}
          disabled={disabled}
          placeholder="Tell us what you think…"
        />
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={feedback.contactMe}
          onChange={(e) => onChange({ ...feedback, contactMe: e.target.checked })}
          disabled={disabled}
        />
        <span>I would like someone to contact me about this.</span>
      </label>
    </div>
  )
}
