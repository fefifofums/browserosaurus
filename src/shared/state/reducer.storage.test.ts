import {
  addedRule,
  removedRule,
  reorderedRule,
  updatedDefaultApp,
} from '../../renderers/prefs/state/actions.js'
import { defaultStorage, storage } from './reducer.storage.js'

test('updatedDefaultApp sets the fallback app', () => {
  const nextState = storage(defaultStorage, updatedDefaultApp('Safari'))

  expect(nextState.defaultAppName).toBe('Safari')
})

test('updatedDefaultApp clears the fallback app', () => {
  const withDefaultApp = storage(defaultStorage, updatedDefaultApp('Safari'))

  const nextState = storage(withDefaultApp, updatedDefaultApp(null))

  expect(nextState.defaultAppName).toBeNull()
})

test('addedRule appends the rule to storage', () => {
  const nextState = storage(
    defaultStorage,
    addedRule({ appName: 'Firefox', pattern: String.raw`github\.com` }),
  )

  expect(nextState.rules).toStrictEqual([
    { appName: 'Firefox', pattern: String.raw`github\.com` },
  ])
})

test('removedRule removes only the rule with the given pattern', () => {
  const withRules = storage(
    defaultStorage,
    addedRule({ appName: 'Firefox', pattern: String.raw`github\.com` }),
  )

  const withSecondRule = storage(
    withRules,
    addedRule({ appName: 'Safari', pattern: String.raw`example\.com` }),
  )

  const nextState = storage(
    withSecondRule,
    removedRule({ pattern: String.raw`github\.com` }),
  )

  expect(nextState.rules).toStrictEqual([
    { appName: 'Safari', pattern: String.raw`example\.com` },
  ])
})

test('reorderedRule moves the source rule to the destination position', () => {
  let state = defaultStorage
  state = storage(
    state,
    addedRule({ appName: 'Firefox', pattern: String.raw`github\.com` }),
  )
  state = storage(
    state,
    addedRule({ appName: 'Safari', pattern: String.raw`example\.com` }),
  )
  state = storage(
    state,
    addedRule({
      appName: 'Brave Browser',
      pattern: String.raw`docs\.qld\.gov`,
    }),
  )

  const nextState = storage(
    state,
    reorderedRule({
      destinationPattern: String.raw`example\.com`,
      sourcePattern: String.raw`docs\.qld\.gov`,
    }),
  )

  expect(nextState.rules).toStrictEqual([
    { appName: 'Firefox', pattern: String.raw`github\.com` },
    { appName: 'Brave Browser', pattern: String.raw`docs\.qld\.gov` },
    { appName: 'Safari', pattern: String.raw`example\.com` },
  ])
})
