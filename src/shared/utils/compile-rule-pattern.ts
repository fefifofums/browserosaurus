/**
 * Compile a rule pattern into a RegExp, or return null if the pattern is
 * not a valid regular expression.
 *
 * Patterns are compiled with the `u` flag and tested against the complete URL
 * string, e.g. `^https?://([^/]+\.)?example\.com`. Note that patterns must
 * therefore be valid in unicode mode, e.g. `[a-z-]` rather than `[a-z\-]`.
 */
export function compileRulePattern(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern, 'u')
  } catch {
    // Pattern is not a valid regular expression.
    return null
  }
}
