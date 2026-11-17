import type { Rule } from '../../shared/state/reducer.storage.js'
import { compileRulePattern } from '../../shared/utils/compile-rule-pattern.js'

/**
 * Find the first rule whose pattern matches the given URL. Invalid patterns
 * are skipped rather than thrown.
 */
export function findMatchingRule(rules: Rule[], url: string): Rule | undefined {
  for (const rule of rules) {
    const regExp = compileRulePattern(rule.pattern)

    if (regExp !== null && regExp.test(url)) return rule
  }

  return undefined
}
