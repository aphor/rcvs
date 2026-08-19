import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const FIELDS = [
  { name: 'firstname', label: 'First name', type: 'text', autoComplete: 'given-name' },
  { name: 'lastname', label: 'Last name', type: 'text', autoComplete: 'family-name' },
  { name: 'mobile', label: 'Mobile', type: 'tel', autoComplete: 'tel' },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel-national' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
]

const emptyForm = () =>
  FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})

// Every contact detail is optional — the only rule is that an email, if given,
// has to look like one. Submitting the form empty is allowed; the backend then
// stands the requesting address in for a name.
function validate(values) {
  const errors = {}
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email'
  }
  return errors
}

export default function RegistrationForm() {
  const { register } = useApp()
  const navigate = useNavigate()
  const [values, setValues] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const onChange = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const found = validate(values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }
    register({
      firstname: values.firstname.trim(),
      lastname: values.lastname.trim(),
      mobile: values.mobile.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
    })
    navigate('/app', { replace: true })
  }

  return (
    <div className="screen">
      <header className="app-header">
        <h1>🍺 Favorite Beer Vote</h1>
        <p className="subtitle">Oak Park Microbrew Review 2026</p>
      </header>

      <form className="card form" onSubmit={onSubmit} noValidate>
        <h2>Register to taste &amp; vote</h2>
        <p className="form-hint">All fields are optional.</p>
        {FIELDS.map((f) => (
          <label key={f.name} className="field">
            <span className="field-label">{f.label}</span>
            <input
              className={errors[f.name] ? 'input input-error' : 'input'}
              type={f.type}
              autoComplete={f.autoComplete}
              value={values[f.name]}
              onChange={onChange(f.name)}
              aria-invalid={Boolean(errors[f.name])}
            />
            {errors[f.name] && <span className="field-error">{errors[f.name]}</span>}
          </label>
        ))}
        <button type="submit" className="btn btn-primary btn-block">
          Start tasting
        </button>
      </form>
      <p>* Please leave valid contact information if you would like FairVote to contact you about questions or suggestions. Otherwise, fill in this form at your discretion.</p>
    </div>
  )
}
