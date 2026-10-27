import type { DragEndEvent } from '@dnd-kit/core'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

import type { AppName } from '../../../../config/apps.js'
import { compileRulePattern } from '../../../../shared/utils/compile-rule-pattern.js'
import Button from '../../../shared/components/atoms/button.js'
import { Spinner } from '../../../shared/components/atoms/spinner.js'
import {
  useDeepEqualSelector,
  useInstalledApps,
} from '../../../shared/state/hooks.js'
import { addedRule, removedRule, reorderedRule } from '../../state/actions.js'
import { Pane } from '../molecules/pane.js'

type SortableRuleProps = {
  readonly appName: AppName
  readonly icon?: string
  readonly id: string
  readonly index: number
  readonly pattern: string
}

const SortableRule = ({
  appName,
  icon = '',
  id,
  index,
  pattern,
}: SortableRuleProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const dispatch = useDispatch()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        'flex',
        'bg-black/5 shadow dark:bg-white/5',
        'mb-4 rounded-xl',
        'focus-visible:bg-white/70 focus-visible:shadow-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-500 dark:focus-visible:bg-black',
        isDragging &&
          'focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-100',
      )}
    >
      <div className="flex w-16 items-center justify-center p-4">
        {index + 1}
      </div>
      <div className="flex grow items-center gap-4 p-4">
        <img
          alt=""
          className={clsx('size-8 shrink-0', !icon && 'hidden')}
          src={icon}
        />
        <div className="flex flex-col">
          <span>{appName}</span>
          <code className="font-mono text-xs opacity-75">{pattern}</code>
        </div>
      </div>
      <div className="flex items-center justify-center p-4">
        <Button
          aria-label={`Remove rule for ${appName}`}
          onClick={() => {
            dispatch(removedRule({ pattern }))
          }}
        >
          ✕
        </Button>
      </div>
    </div>
  )
}

export function RulesPane(): JSX.Element {
  const dispatch = useDispatch()

  const installedApps = useInstalledApps()

  const rules = useDeepEqualSelector((state) => state.storage.rules)

  const icons = useDeepEqualSelector((state) => state.data.icons)

  const [appName, setAppName] = useState<AppName | ''>('')
  const [pattern, setPattern] = useState('')
  const [error, setError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      dispatch(
        reorderedRule({
          destinationPattern: over?.id as string,
          sourcePattern: active.id as string,
        }),
      )
    }
  }

  const onAddRuleClick = () => {
    if (!appName) {
      setError('Select an app first.')
      return
    }

    if (!pattern) {
      setError('Enter a regular expression.')
      return
    }

    if (compileRulePattern(pattern) === null) {
      setError('Invalid regular expression.')
      return
    }

    if (rules.some((rule) => rule.pattern === pattern)) {
      setError('This pattern is already used by another rule.')
      return
    }

    dispatch(addedRule({ appName, pattern }))
    setPattern('')
    setError('')
  }

  return (
    <Pane pane="rules">
      {installedApps.length === 0 && (
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      )}

      <div className="flex grow flex-col overflow-hidden p-2">
        <div className="mb-4 flex gap-2">
          <select
            aria-label="App"
            className={clsx(
              'min-w-0 grow',
              'focus:bg-white/70 focus:shadow-xl focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:bg-black',
              'bg-white shadow-sm dark:bg-[#56555C]',
              'text-black dark:text-white',
              'border',
              'border-b-[#C1BFBF] dark:border-b-[#56555C]',
              'border-l-[#D4D2D2] dark:border-l-[#56555C]',
              'border-r-[#D4D2D2] dark:border-r-[#56555C]',
              'border-t-[#DAD8D8] dark:border-t-[#6E6D73]',
              'rounded px-2 py-1',
            )}
            onChange={(event) => {
              setAppName(event.target.value as AppName)
              setError('')
            }}
            value={appName}
          >
            <option value="">Select an app…</option>
            {installedApps.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <input
            aria-label="Regular expression"
            className={clsx(
              'min-w-0 grow',
              'font-mono',
              'focus:bg-white/70 focus:shadow-xl focus:outline-none focus:ring-1 focus:ring-gray-500 dark:focus:bg-black',
              'bg-white shadow-sm dark:bg-[#56555C]',
              'text-black dark:text-white',
              'border',
              'border-b-[#C1BFBF] dark:border-b-[#56555C]',
              'border-l-[#D4D2D2] dark:border-l-[#56555C]',
              'border-r-[#D4D2D2] dark:border-r-[#56555C]',
              'border-t-[#DAD8D8] dark:border-t-[#6E6D73]',
              'rounded px-2 py-1',
            )}
            onChange={(event) => {
              setPattern(event.target.value)
              setError('')
            }}
            placeholder="(^|\.)example\.com"
            type="text"
            value={pattern}
          />
          <Button onClick={onAddRuleClick}>Add</Button>
        </div>

        {error ? (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          sensors={sensors}
        >
          <div className="grow overflow-y-auto">
            <SortableContext
              items={rules.map((rule) => rule.pattern)}
              strategy={verticalListSortingStrategy}
            >
              {rules.map((rule, index) => (
                <SortableRule
                  key={rule.pattern}
                  appName={rule.appName}
                  icon={icons[rule.appName]}
                  id={rule.pattern}
                  index={index}
                  pattern={rule.pattern}
                />
              ))}
            </SortableContext>

            {rules.length === 0 ? (
              <p className="m-4 text-center text-sm opacity-70">
                No rules yet. Add one above to open matching URLs directly in a
                chosen app, without the picker.
              </p>
            ) : null}
          </div>
        </DndContext>

        <p className="mt-2 text-sm opacity-70">
          URLs are tested against each pattern, a JavaScript regular expression,
          from top to bottom: the first matching rule wins and opens the URL in
          its app. Patterns match against the complete URL, so anchor or escape
          patterns as needed, e.g.
          <code className="font-mono">
            {String.raw`^https?://([^/]+\.)?example\.com`}
          </code>
          . If the app of a matching rule is not installed, the picker is shown
          as normal.
        </p>
      </div>
    </Pane>
  )
}
