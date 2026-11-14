import { HttpError } from './errors.js'

/**
 * Validates req.body against a zod schema and replaces it with the parsed,
 * cleaned value. Responds 400 with field-level messages on failure.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {})
    if (!result.success) {
      const fields = {}
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || 'body'
        fields[key] ??= issue.message
      }
      return next(new HttpError(400, 'Please check the highlighted fields.', { fields }))
    }
    req.body = result.data
    next()
  }
}
