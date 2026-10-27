import { useDispatch } from 'react-redux'

import type { AppName } from '../../../../config/apps.js'
import Button from '../../../shared/components/atoms/button.js'
import Select from '../../../shared/components/atoms/select.js'
import { useInstalledApps, useSelector } from '../../../shared/state/hooks.js'
import {
  clickedRescanApps,
  clickedSetAsDefaultBrowserButton,
  clickedUpdateButton,
  clickedUpdateRestartButton,
  confirmedReset,
  updatedDefaultApp,
} from '../../state/actions.js'
import { Pane } from '../molecules/pane.js'

type RowProps = {
  readonly children: React.ReactNode
}

const Row = ({ children }: RowProps): JSX.Element => (
  <div className="grid grid-cols-12 gap-8">{children}</div>
)

type LeftProps = {
  readonly children: React.ReactNode
}

const Left = ({ children }: LeftProps): JSX.Element => (
  <div className="col-span-5 text-right">{children}</div>
)

type RightProps = {
  readonly children: React.ReactNode
}

const Right = ({ children }: RightProps): JSX.Element => (
  <div className="col-span-7">{children}</div>
)

export const GeneralPane = (): JSX.Element => {
  const dispatch = useDispatch()

  const isDefaultProtocolClient = useSelector(
    (state) => state.data.isDefaultProtocolClient,
  )

  const updateStatus = useSelector((state) => state.data.updateStatus)

  const numberOfInstalledApps = useSelector(
    (state) => state.storage.apps.filter((app) => app.isInstalled).length,
  )

  const installedApps = useInstalledApps()

  const defaultAppName = useSelector((state) => state.storage.defaultAppName)

  return (
    <Pane className="space-y-8" pane="general">
      <Row>
        <Left>Default web browser:</Left>
        <Right>
          {isDefaultProtocolClient ? (
            'Browserosaurus is the default web browser'
          ) : (
            <Button
              onClick={() => dispatch(clickedSetAsDefaultBrowserButton())}
            >
              Set As Default Browser
            </Button>
          )}
          <p className="mt-2 text-sm opacity-70">
            Setting Browserosaurus as your default web browser means links
            clicked outside of web browsers will open the picker window. This is
            the primary design of Browserosaurus. However, you can also
            programmatically send URLs to Browserosaurus.
          </p>
        </Right>
      </Row>

      <Row>
        <Left>Fallback app:</Left>
        <Right>
          <Select
            onChange={(event) => {
              dispatch(
                updatedDefaultApp(
                  event.target.value === ''
                    ? null
                    : (event.target.value as AppName),
                ),
              )
            }}
            value={defaultAppName ?? ''}
          >
            <option value="">Show the picker</option>
            {installedApps.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
          <p className="mt-2 text-sm opacity-70">
            URLs that do not match any rule open in this app, without a prompt.
            Choose Show the picker to always decide manually. Links still open
            in the app of a matching rule, above all else.
          </p>
        </Right>
      </Row>

      <Row>
        <Left>Find apps:</Left>
        <Right>
          <Button onClick={() => dispatch(clickedRescanApps())}>Rescan</Button>
          <p className="mt-2 text-sm opacity-70">
            {numberOfInstalledApps} compatible apps found. Rescan if you have
            added or removed a compatible app whilst Browserosaurus is running.
          </p>
        </Right>
      </Row>

      <Row>
        <Left>Update:</Left>
        <Right>
          {updateStatus === 'available' && (
            <Button onClick={() => dispatch(clickedUpdateButton())}>
              Download Update
            </Button>
          )}
          {updateStatus === 'downloading' && 'Downloading…'}
          {updateStatus === 'downloaded' && (
            <Button onClick={() => dispatch(clickedUpdateRestartButton())}>
              Restart & Update
            </Button>
          )}
          {updateStatus === 'no-update' && 'No update available'}
        </Right>
      </Row>

      <Row>
        <Left>Factory Reset:</Left>
        <Right>
          <Button
            onClick={() => {
              // eslint-disable-next-line no-restricted-globals, no-alert
              if (confirm('Are you sure you wish to reset all preferences?')) {
                dispatch(confirmedReset())
              }
            }}
          >
            Reset
          </Button>
          <p className="mt-2 text-sm opacity-70">
            Restores all preferences to initial defaults and restarts the app as
            if run for the first time.
          </p>
        </Right>
      </Row>
    </Pane>
  )
}
