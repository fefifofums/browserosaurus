import { createReducer } from '@reduxjs/toolkit'

import type { AppName } from '../../config/apps.js'
import {
  changedPickerWindowBounds,
  readiedApp,
  receivedRendererStartupSignal,
  retrievedInstalledApps,
} from '../../main/state/actions.js'
import {
  clickedDonate,
  clickedMaybeLater,
} from '../../renderers/picker/state/actions.js'
import {
  addedRule,
  confirmedReset,
  removedRule,
  reorderedApp,
  reorderedRule,
  updatedHotCode,
} from '../../renderers/prefs/state/actions.js'

type Rule = {
  appName: AppName
  pattern: string
}

type Storage = {
  apps: {
    name: AppName
    hotCode: string | null
    isInstalled: boolean
  }[]
  rules: Rule[]
  supportMessage: number
  isSetup: boolean
  height: number
}

const defaultStorage: Storage = {
  apps: [],
  height: 200,
  isSetup: false,
  rules: [],
  supportMessage: 0,
}

const storage = createReducer<Storage>(defaultStorage, (builder) =>
  builder
    .addCase(readiedApp, (state) => {
      state.isSetup = true
    })

    .addCase(confirmedReset, () => defaultStorage)

    .addCase(
      receivedRendererStartupSignal,
      (_, action) => action.payload.storage,
    )

    .addCase(retrievedInstalledApps, (state, action) => {
      const installedAppNames = action.payload

      for (const storedApp of state.apps) {
        storedApp.isInstalled = installedAppNames.includes(storedApp.name)
      }

      for (const installedAppName of installedAppNames) {
        const installedAppInStorage = state.apps.some(
          ({ name }) => name === installedAppName,
        )

        if (!installedAppInStorage) {
          state.apps.push({
            hotCode: null,
            isInstalled: true,
            name: installedAppName,
          })
        }
      }
    })

    .addCase(updatedHotCode, (state, action) => {
      const hotCode = action.payload.value

      const appWithSameHotCodeIndex = state.apps.findIndex(
        (app) => app.hotCode === hotCode,
      )

      if (appWithSameHotCodeIndex !== -1) {
        state.apps[appWithSameHotCodeIndex].hotCode = null
      }

      const appIndex = state.apps.findIndex(
        (app) => app.name === action.payload.appName,
      )

      state.apps[appIndex].hotCode = hotCode
    })

    .addCase(addedRule, (state, action) => {
      state.rules.push({
        appName: action.payload.appName,
        pattern: action.payload.pattern,
      })
    })

    .addCase(removedRule, (state, action) => {
      const ruleIndex = state.rules.findIndex(
        (rule) => rule.pattern === action.payload.pattern,
      )

      if (ruleIndex !== -1) {
        state.rules.splice(ruleIndex, 1)
      }
    })

    .addCase(reorderedRule, (state, action) => {
      const sourceIndex = state.rules.findIndex(
        (rule) => rule.pattern === action.payload.sourcePattern,
      )

      const destinationIndex = state.rules.findIndex(
        (rule) => rule.pattern === action.payload.destinationPattern,
      )

      const [removed] = state.rules.splice(sourceIndex, 1)
      state.rules.splice(destinationIndex, 0, removed)
    })

    .addCase(clickedDonate, (state) => {
      state.supportMessage = -1
    })

    .addCase(clickedMaybeLater, (state) => {
      state.supportMessage = Date.now()
    })

    .addCase(changedPickerWindowBounds, (state, action) => {
      state.height = action.payload.height
    })

    .addCase(reorderedApp, (state, action) => {
      const sourceIndex = state.apps.findIndex(
        (app) => app.name === action.payload.sourceName,
      )

      const destinationIndex = state.apps.findIndex(
        (app) => app.name === action.payload.destinationName,
      )

      const [removed] = state.apps.splice(sourceIndex, 1)
      state.apps.splice(destinationIndex, 0, removed)
    }),
)

export { defaultStorage, Rule, Storage, storage }
