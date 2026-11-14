/** Error line under a field. Announced politely to screen readers. */
export function FieldError({ id, message }) {
  return (
    <p id={id} role="alert" aria-live="polite" className="mt-2 min-h-5 text-sm text-danger">
      {message}
    </p>
  )
}
