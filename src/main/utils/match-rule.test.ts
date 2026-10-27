import { findMatchingRule } from './match-rule.js'

test('returns undefined when rules array is empty', () => {
  expect(findMatchingRule([], 'https://github.com')).toBeUndefined()
})

test('returns matching rule', () => {
  const rule = {
    appName: 'Firefox',
    pattern: String.raw`github\.com`,
  } as const

  expect(
    findMatchingRule([rule], 'https://github.com/will-stone/browserosaurus'),
  ).toStrictEqual(rule)
})

test('matches against the complete URL string', () => {
  const rule = {
    appName: 'Firefox',
    pattern: String.raw`^https?://example\.com/`,
  } as const

  // Anchored pattern does not match URLs where the pattern occurs later
  expect(
    findMatchingRule([rule], 'https://other.com/?redirect=example.com/'),
  ).toBeUndefined()

  expect(
    findMatchingRule([rule], 'https://example.com/any/path'),
  ).toStrictEqual(rule)
})

test('first match wins', () => {
  const first = { appName: 'Firefox', pattern: 'github' } as const
  const second = {
    appName: 'Safari',
    pattern: String.raw`github\.com`,
  } as const

  expect(findMatchingRule([first, second], 'https://github.com')).toStrictEqual(
    first,
  )

  // Reordered rules change the winner
  expect(findMatchingRule([second, first], 'https://github.com')).toStrictEqual(
    second,
  )
})

test('skips invalid patterns instead of throwing', () => {
  const unclosedGroup = { appName: 'Firefox', pattern: '(' } as const
  const unicodeInvalid = {
    appName: 'Safari',
    // Invalid under the u flag: `\-` is an unnecessary escape in a class
    pattern: String.raw`example\.com[a-z\-]`,
  } as const
  const valid = {
    appName: 'Brave Browser',
    pattern: String.raw`example\.com`,
  } as const

  expect(
    findMatchingRule(
      [unclosedGroup, unicodeInvalid, valid],
      'https://example.com',
    ),
  ).toStrictEqual(valid)

  expect(
    findMatchingRule([unclosedGroup], 'https://github.com'),
  ).toBeUndefined()
})

test('returns undefined when no rule matches', () => {
  const rules = [
    {
      appName: 'Firefox',
      pattern: String.raw`github\.com`,
    } as const,
    {
      appName: 'Safari',
      pattern: String.raw`example\.com`,
    } as const,
  ]

  expect(findMatchingRule(rules, 'https://gitlab.com')).toBeUndefined()
})
