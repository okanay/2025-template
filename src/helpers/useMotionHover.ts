import { useRef, useCallback, useState, useEffect, useMemo } from 'react'
import { AnimationDefinition, LegacyAnimationControls } from 'framer-motion'

// --- 1. STATE DEFINITIONS ---

/**
 * Enum representing all possible states in the hover animation state machine.
 *
 * The state machine handles complex hover interactions with timing considerations,
 * preventing flickering and providing smooth transitions between states.
 */
export enum HoverState {
  /** Default idle state - no interaction, element at rest */
  IDLE = 'idle',
  /** Active hover state - mouse is over element and hover animation is playing */
  HOVER = 'hover',
  /** Quick return to idle from hover state (when hover was too brief) */
  EARLY_HOVER_RETURN = 'early-hover-return',
  /** Exit animation is playing after mouse leave */
  EXIT = 'exit',
  /** Quick return to hover from exit state (mouse re-entered during exit) */
  EARLY_EXIT_RETURN = 'early-exit-return',
  /** Exit animation is locked to prevent flickering on quick re-entries */
  LATE_EXIT_LOCK = 'late-exit-lock',
  /** Soft-locked in idle state (mouse events can unlock) */
  LOCKED_IDLE = 'locked-idle',
  /** Soft-locked in hover state (mouse events can unlock) */
  LOCKED_HOVER = 'locked-hover',
  /** Hard-locked in idle state (mouse events ignored) */
  HARD_LOCKED_IDLE = 'hard-locked-idle',
  /** Hard-locked in hover state (mouse events ignored) */
  HARD_LOCKED_HOVER = 'hard-locked-hover',
}

/**
 * Internal event types used by the state machine dispatcher.
 * @private
 */
type EventType =
  | 'MOUSE_ENTER'
  | 'MOUSE_LEAVE'
  | 'ANIMATION_COMPLETE'
  | 'TIMER_FIRED'
  | 'FORCE_RESET'
  | 'SET_LOCK_STATE'

/**
 * Parameters for setting lock state.
 * @private
 */
type LockParams = {
  /** The lock state to transition to */
  state: 'idle' | 'hover' | 'hard-idle' | 'hard-hover'
  /** How to transition: 'set' for instant, 'animate' for smooth */
  transition: 'set' | 'animate'
}

// --- 2. PUBLIC HOOK INTERFACE TYPES ---

/**
 * Configuration props for the useMotionHover hook.
 */
export type HoverProps = {
  /** Framer Motion variant name for the initial/idle state */
  initialVariant: string
  /** Framer Motion variant name for the hover state */
  hoverVariant: string
  /** Framer Motion variant name for the exit animation */
  exitVariant: string
  /**
   * Determines how to transition from exit to idle state.
   * Options are 'animate' for smooth transitions or 'teleport' for instant transitions.
   * @default 'animate'
   */
  exitToIdle?: 'animate' | 'teleport'
  /**
   * Minimum time (ms) mouse must hover before committing to hover state.
   * Prevents accidental hover triggers on quick mouse movements.
   * @default 200
   */
  hoverIntentMs?: number
  /**
   * Time (ms) to lock exit animation, preventing flicker on quick re-entries.
   * @default 250
   */
  exitCommitMs?: number
  /**
   * Delay (ms) before restarting hover after exit lock expires.
   * @default 50
   */
  restartDelayMs?: number
  /**
   * Callback fired whenever the state machine transitions to a new state.
   * Useful for debugging, analytics, or additional side effects.
   */
  onStateChange?: (state: HoverState) => void
}

/**
 * Return value from the useMotionHover hook containing state and control functions.
 */
export type HoverReturn = {
  /** Current state of the hover animation state machine */
  state: HoverState
  /** Whether the mouse is currently over the element */
  isMouseOver: boolean
  /** Whether an animation is currently in progress */
  isAnimating: boolean
  /** Whether the animation is soft-locked (mouse events can unlock) */
  isLocked: boolean
  /** Whether the animation is hard-locked (mouse events ignored) */
  isHardLocked: boolean
  /**
   * Handler to be passed to Framer Motion's onHoverStart prop.
   * Triggers mouse enter logic in the state machine.
   */
  onHoverStart: (event: any, info: any) => void
  /**
   * Handler to be passed to Framer Motion's onHoverEnd prop.
   * Triggers mouse leave logic in the state machine.
   */
  onHoverEnd: (event: any, info: any) => void
  /**
   * Handler to be passed to Framer Motion's onAnimationComplete prop.
   * Notifies state machine when animations finish.
   */
  onAnimationComplete: (definition: AnimationDefinition) => void
  /**
   * Force immediate reset to idle state, clearing all timers and locks.
   * Useful for error recovery or manual state management.
   */
  forceReset: () => void
  /**
   * Lock the animation in a specific state.
   *
   * @param state - The state to lock to: 'idle', 'hover', 'hard-idle', or 'hard-hover'
   * @param transition - How to transition: 'set' for instant, 'animate' for smooth
   *
   * @example
   * // Soft lock in hover state with smooth transition
   * setLockState('hover', 'animate')
   *
   * @example
   * // Hard lock in idle state with instant transition
   * setLockState('hard-idle', 'set')
   */
  setLockState: (
    state: 'idle' | 'hover' | 'hard-idle' | 'hard-hover',
    transition?: 'set' | 'animate',
  ) => void
  /**
   * Unlock from any locked state and return to natural behavior.
   * The target state will be determined by current mouse position.
   */
  unlock: () => void
}

// --- 3. INTERNAL STATE AND TRANSITION RULES ---

/**
 * Internal state structure used by the hook.
 * @private
 */
type InternalState = {
  /** Current state in the state machine */
  current: HoverState
  /** Previous state (for transition logic) */
  previous: HoverState
  /** Mouse tracking state */
  mouseState: { isOver: boolean }
  /** Timing information for hover intent detection */
  timing: { hoverStartTime: number }
  /** Flags for pending operations */
  flags: { pendingHover: boolean }
  /** Safety mechanism to prevent race conditions */
  safety: { operationId: number }
  /** Cached configuration to detect changes */
  config: { initialVariant: string; hoverVariant: string; exitVariant: string }
  /** Lock state tracking */
  lock: { isLocked: boolean; isHardLocked: boolean; preLockedState: HoverState | null }
}

/**
 * Check if a state is any type of locked state.
 * @private
 */
const isLockedState = (state: HoverState): boolean => {
  return [
    HoverState.LOCKED_IDLE,
    HoverState.LOCKED_HOVER,
    HoverState.HARD_LOCKED_IDLE,
    HoverState.HARD_LOCKED_HOVER,
  ].includes(state)
}

/**
 * Check if a state is a hard-locked state (ignores mouse events).
 * @private
 */
const isHardLockedState = (state: HoverState): boolean => {
  return [HoverState.HARD_LOCKED_IDLE, HoverState.HARD_LOCKED_HOVER].includes(state)
}

/**
 * Valid state transitions matrix.
 * Defines which states can transition to which other states.
 * @private
 */
const VALID_TRANSITIONS: Record<HoverState, HoverState[]> = {
  [HoverState.IDLE]: [
    HoverState.HOVER,
    HoverState.LOCKED_IDLE,
    HoverState.LOCKED_HOVER,
    HoverState.HARD_LOCKED_IDLE,
    HoverState.HARD_LOCKED_HOVER,
  ],
  [HoverState.HOVER]: [
    HoverState.EARLY_HOVER_RETURN,
    HoverState.EXIT,
    HoverState.LOCKED_IDLE,
    HoverState.LOCKED_HOVER,
    HoverState.HARD_LOCKED_IDLE,
    HoverState.HARD_LOCKED_HOVER,
  ],
  [HoverState.EARLY_HOVER_RETURN]: [
    HoverState.IDLE,
    HoverState.HOVER,
    HoverState.LOCKED_IDLE,
    HoverState.LOCKED_HOVER,
    HoverState.HARD_LOCKED_IDLE,
    HoverState.HARD_LOCKED_HOVER,
  ],
  [HoverState.EXIT]: [
    HoverState.EARLY_EXIT_RETURN,
    HoverState.LATE_EXIT_LOCK,
    HoverState.IDLE,
    HoverState.LOCKED_IDLE,
    HoverState.LOCKED_HOVER,
    HoverState.HARD_LOCKED_IDLE,
    HoverState.HARD_LOCKED_HOVER,
  ],
  [HoverState.EARLY_EXIT_RETURN]: [
    HoverState.HOVER,
    HoverState.EXIT,
    HoverState.LOCKED_IDLE,
    HoverState.LOCKED_HOVER,
    HoverState.HARD_LOCKED_IDLE,
    HoverState.HARD_LOCKED_HOVER,
  ],
  [HoverState.LATE_EXIT_LOCK]: [
    HoverState.IDLE,
    HoverState.LOCKED_IDLE,
    HoverState.LOCKED_HOVER,
    HoverState.HARD_LOCKED_IDLE,
    HoverState.HARD_LOCKED_HOVER,
  ],
  [HoverState.LOCKED_IDLE]: [
    HoverState.IDLE,
    HoverState.HOVER,
    HoverState.LOCKED_HOVER,
    HoverState.HARD_LOCKED_IDLE,
    HoverState.HARD_LOCKED_HOVER,
  ],
  [HoverState.LOCKED_HOVER]: [
    HoverState.IDLE,
    HoverState.HOVER,
    HoverState.LOCKED_IDLE,
    HoverState.HARD_LOCKED_IDLE,
    HoverState.HARD_LOCKED_HOVER,
  ],
  [HoverState.HARD_LOCKED_IDLE]: [
    HoverState.IDLE,
    HoverState.HOVER,
    HoverState.LOCKED_IDLE,
    HoverState.LOCKED_HOVER,
    HoverState.HARD_LOCKED_HOVER,
  ],
  [HoverState.HARD_LOCKED_HOVER]: [
    HoverState.IDLE,
    HoverState.HOVER,
    HoverState.LOCKED_IDLE,
    HoverState.LOCKED_HOVER,
    HoverState.HARD_LOCKED_IDLE,
  ],
}

// --- 4. THE HOOK IMPLEMENTATION ---

/**
 * Advanced React hook for managing complex hover animations with Framer Motion.
 *
 * @example
 * ```tsx
 * const controls = useAnimation()
 * const hover = useMotionHover(controls, {
 *   initialVariant: 'initial',
 *   hoverVariant: 'hover',
 *   exitVariant: 'exit',
 *   hoverIntentMs: 200
 *   exitCommitMs: 250,
 *   restartDelayMs: 50,
 *   onStateChange: (state) => console.log(state),
 * })
 *
 * This hook provides sophisticated hover interaction management including:
 * - Hover intent detection to prevent accidental triggers
 * - Smooth transitions between hover states
 * - Lock mechanisms for precise animation control
 * - Race condition protection
 * - Dynamic variant updates
 * ```
 */
export const useMotionHover = (
  controls: LegacyAnimationControls,
  config: HoverProps,
): HoverReturn => {
  const {
    initialVariant,
    hoverVariant,
    exitVariant,
    hoverIntentMs = 200,
    exitCommitMs = 250,
    restartDelayMs = 50,
    exitToIdle = 'teleport',
    onStateChange,
  } = config

  // Memoize config to detect changes and trigger updates
  const memoizedConfig = useMemo(
    () => ({ initialVariant, hoverVariant, exitVariant }),
    [initialVariant, hoverVariant, exitVariant],
  )

  // Internal state ref (doesn't trigger re-renders)
  const internalState = useRef<InternalState>({
    current: HoverState.IDLE,
    previous: HoverState.IDLE,
    mouseState: { isOver: false },
    timing: { hoverStartTime: 0 },
    flags: { pendingHover: false },
    safety: { operationId: 0 },
    config: memoizedConfig,
    lock: { isLocked: false, isHardLocked: false, preLockedState: null },
  })

  // Public state (triggers re-renders when changed)
  const [currentState, setCurrentState] = useState<HoverState>(HoverState.IDLE)
  const [isMouseOver, setIsMouseOver] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [isHardLocked, setIsHardLocked] = useState(false)

  // Timer references for cleanup
  const exitCommitTimer = useRef<NodeJS.Timeout | null>(null)
  const restartDelayTimer = useRef<NodeJS.Timeout | null>(null)

  /**
   * Clear all active timers to prevent memory leaks and unwanted executions.
   */
  const clearAllTimeouts = useCallback(() => {
    if (exitCommitTimer.current) clearTimeout(exitCommitTimer.current)
    if (restartDelayTimer.current) clearTimeout(restartDelayTimer.current)
  }, [])

  /**
   * Safely animate to a target variant with race condition protection.
   *
   * @param targetVariant - The Framer Motion variant to animate to
   * @param operationId - Unique ID to prevent race conditions
   */
  const safeAnimate = useCallback(
    async (targetVariant: string, operationId: number) => {
      // Check if this operation is still valid (not superseded by a newer one)
      if (internalState.current.safety.operationId !== operationId) return

      setIsAnimating(true)
      try {
        await controls.start(targetVariant)
      } catch (e) {
        // Animation was interrupted - this is normal behavior
      } finally {
        // Only update state if this operation is still current
        if (internalState.current.safety.operationId === operationId) {
          setIsAnimating(false)
        }
      }
    },
    [controls],
  )

  /**
   * Transition to a new state if the transition is valid.
   * Updates both internal state and public state accordingly.
   *
   * @param nextState - The state to transition to
   */
  const transitionToState = useCallback(
    (nextState: HoverState) => {
      const state = internalState.current
      if (state.current === nextState) return

      const allowedTransitions = VALID_TRANSITIONS[state.current]
      if (allowedTransitions?.includes(nextState)) {
        state.previous = state.current
        state.current = nextState
        setCurrentState(nextState)

        // Update lock state flags
        const locked = isLockedState(nextState)
        const hardLocked = isHardLockedState(nextState)
        state.lock.isLocked = locked
        state.lock.isHardLocked = hardLocked
        setIsLocked(locked)
        setIsHardLocked(hardLocked)

        // Notify external listeners
        onStateChange?.(nextState)
      } else {
        console.warn(`Invalid transition: ${state.current} -> ${nextState}`)
      }
    },
    [onStateChange],
  )

  /**
   * Main event dispatcher for the state machine.
   * Handles all events and triggers appropriate state transitions.
   *
   * @param type - The type of event to dispatch
   * @param payload - Optional payload data for the event
   */
  const dispatch = useCallback(
    (type: EventType, payload?: any) => {
      const state = internalState.current
      // Increment operation ID to invalidate any pending async operations
      state.safety.operationId++
      clearAllTimeouts()

      switch (type) {
        case 'MOUSE_ENTER':
          state.mouseState.isOver = true
          setIsMouseOver(true)
          state.timing.hoverStartTime = Date.now()

          // Hard lock ignores all mouse events
          if (isHardLockedState(state.current)) {
            return
          }

          // Soft lock: unlock and continue with normal flow
          if (
            state.current === HoverState.LOCKED_IDLE ||
            state.current === HoverState.LOCKED_HOVER
          ) {
            transitionToState(HoverState.HOVER)
            return
          }

          // Normal state transitions
          if (
            state.current === HoverState.IDLE ||
            state.current === HoverState.EARLY_HOVER_RETURN
          ) {
            transitionToState(HoverState.HOVER)
          } else if (state.current === HoverState.EXIT) {
            transitionToState(HoverState.EARLY_EXIT_RETURN)
          } else if (state.current === HoverState.LATE_EXIT_LOCK) {
            // Queue hover for when lock expires
            state.flags.pendingHover = true
          }
          break

        case 'MOUSE_LEAVE':
          state.mouseState.isOver = false
          setIsMouseOver(false)
          state.flags.pendingHover = false

          // Hard lock ignores all mouse events
          if (isHardLockedState(state.current)) {
            return
          }

          // Soft lock: unlock and continue with normal flow
          if (state.current === HoverState.LOCKED_HOVER) {
            const hoverDuration = Date.now() - state.timing.hoverStartTime
            transitionToState(
              hoverDuration < hoverIntentMs ? HoverState.EARLY_HOVER_RETURN : HoverState.EXIT,
            )
            return
          } else if (state.current === HoverState.LOCKED_IDLE) {
            // Already in idle-like state, no action needed
            return
          }

          // Normal state transitions based on hover duration
          const hoverDuration = Date.now() - state.timing.hoverStartTime
          if (state.current === HoverState.HOVER) {
            transitionToState(
              hoverDuration < hoverIntentMs ? HoverState.EARLY_HOVER_RETURN : HoverState.EXIT,
            )
          } else if (state.current === HoverState.EARLY_EXIT_RETURN) {
            transitionToState(HoverState.EXIT)
          }
          break

        case 'SET_LOCK_STATE':
          const { state: lockState, transition } = payload as LockParams
          let targetState: HoverState
          let targetVariant: string

          // Determine target state and variant based on lock type
          switch (lockState) {
            case 'idle':
              targetState = HoverState.LOCKED_IDLE
              targetVariant = state.config.initialVariant
              break
            case 'hover':
              targetState = HoverState.LOCKED_HOVER
              targetVariant = state.config.hoverVariant
              break
            case 'hard-idle':
              targetState = HoverState.HARD_LOCKED_IDLE
              targetVariant = state.config.initialVariant
              break
            case 'hard-hover':
              targetState = HoverState.HARD_LOCKED_HOVER
              targetVariant = state.config.hoverVariant
              break
          }

          // Store pre-lock state for potential unlock operation
          if (!isLockedState(state.current)) {
            state.lock.preLockedState = state.current
          }

          transitionToState(targetState)

          // Apply animation or instant set based on transition type
          if (transition === 'set') {
            controls.set(targetVariant)
          } else {
            safeAnimate(targetVariant, state.safety.operationId)
          }
          break

        case 'TIMER_FIRED':
          if (payload.type === 'EXIT_COMMIT' && state.current === HoverState.EXIT) {
            transitionToState(HoverState.LATE_EXIT_LOCK)
          }
          break

        case 'ANIMATION_COMPLETE':
          // Handle exit animation completion
          if (payload.variant === internalState.current.config.exitVariant) {
            transitionToState(HoverState.IDLE)
          }
          break

        case 'FORCE_RESET':
          // Complete reset to initial state
          state.mouseState.isOver = false
          setIsMouseOver(false)
          setIsAnimating(false)
          state.lock.isLocked = false
          state.lock.isHardLocked = false
          state.lock.preLockedState = null
          setIsLocked(false)
          setIsHardLocked(false)
          controls.set(state.config.initialVariant)
          if (state.current !== HoverState.IDLE) {
            state.current = HoverState.IDLE
            setCurrentState(HoverState.IDLE)
          }
          break
      }
    },
    [clearAllTimeouts, transitionToState, hoverIntentMs, controls, safeAnimate],
  )

  /**
   * Lock the animation in a specific state.
   *
   * @param state - The state to lock to
   * @param transition - How to transition to the locked state
   */
  const setLockState = useCallback(
    (
      state: 'idle' | 'hover' | 'hard-idle' | 'hard-hover',
      transition: 'set' | 'animate' = 'animate',
    ) => {
      dispatch('SET_LOCK_STATE', { state, transition })
    },
    [dispatch],
  )

  /**
   * Unlock from any locked state and return to natural behavior.
   * The target state is determined by current mouse position.
   */
  const unlock = useCallback(() => {
    const state = internalState.current

    if (!isLockedState(state.current)) {
      return // Not locked, nothing to do
    }

    // Determine target state based on mouse position
    const targetState = state.mouseState.isOver ? HoverState.HOVER : HoverState.IDLE
    const targetVariant = state.mouseState.isOver
      ? state.config.hoverVariant
      : state.config.initialVariant

    transitionToState(targetState)
    safeAnimate(targetVariant, state.safety.operationId)
  }, [transitionToState, safeAnimate])

  /**
   * SIDE EFFECT MANAGER: Triggers animations when state changes.
   * This effect handles all the animation logic based on state transitions.
   */
  useEffect(() => {
    const state = internalState.current
    const opId = state.safety.operationId
    const { hoverVariant, initialVariant, exitVariant } = state.config

    // Skip animation for locked states (handled in dispatch)
    if (isLockedState(currentState)) {
      return
    }

    switch (currentState) {
      case HoverState.HOVER:
        safeAnimate(hoverVariant, opId)
        break

      case HoverState.EARLY_HOVER_RETURN:
        safeAnimate(initialVariant, opId).then(() => {
          // Only transition if mouse is still out and operation is current
          if (!state.mouseState.isOver && state.safety.operationId === opId) {
            transitionToState(HoverState.IDLE)
          }
        })
        break

      case HoverState.EXIT:
        safeAnimate(exitVariant, opId)
        // Set timer to lock exit animation
        exitCommitTimer.current = setTimeout(() => {
          dispatch('TIMER_FIRED', { type: 'EXIT_COMMIT' })
        }, exitCommitMs)
        break

      case HoverState.EARLY_EXIT_RETURN:
        safeAnimate(hoverVariant, opId).then(() => {
          // Only transition if mouse is still over and operation is current
          if (state.mouseState.isOver && state.safety.operationId === opId) {
            transitionToState(HoverState.HOVER)
          }
        })
        break

      case HoverState.IDLE:
        // Handle transition from locked states
        if (state.previous === HoverState.LATE_EXIT_LOCK || state.previous === HoverState.EXIT) {
          if (exitToIdle === 'teleport') {
            controls.set(initialVariant)
          } else {
            controls.start(initialVariant)
          }
          // Check for pending hover (queued during lock)
          if (state.flags.pendingHover) {
            state.flags.pendingHover = false
            restartDelayTimer.current = setTimeout(() => {
              dispatch('MOUSE_ENTER')
            }, restartDelayMs)
          }
        }
        break
    }
  }, [
    currentState,
    safeAnimate,
    transitionToState,
    dispatch,
    exitCommitMs,
    restartDelayMs,
    controls,
  ])

  /**
   * SMART VARIANT CHANGE MANAGER: Handles dynamic variant updates.
   * When variant props change, this effect smoothly transitions to the new variants.
   */
  useEffect(() => {
    const state = internalState.current
    const hasChanged =
      state.config.initialVariant !== memoizedConfig.initialVariant ||
      state.config.hoverVariant !== memoizedConfig.hoverVariant ||
      state.config.exitVariant !== memoizedConfig.exitVariant

    if (hasChanged) {
      // Update internal config immediately
      state.config = memoizedConfig

      // Start new operation to prevent race conditions
      const opId = ++state.safety.operationId

      // Handle locked states specially
      if (isLockedState(state.current)) {
        const isHover =
          state.current === HoverState.LOCKED_HOVER ||
          state.current === HoverState.HARD_LOCKED_HOVER
        const targetVariant = isHover ? memoizedConfig.hoverVariant : memoizedConfig.initialVariant
        safeAnimate(targetVariant, opId)
      } else {
        // Handle normal states based on mouse position
        if (state.mouseState.isOver) {
          // Mouse over: smoothly transition to new hover variant
          transitionToState(HoverState.HOVER)
          safeAnimate(memoizedConfig.hoverVariant, opId)
        } else {
          // Mouse out: instantly set to new initial variant
          controls.set(memoizedConfig.initialVariant)
          transitionToState(HoverState.IDLE)
        }
      }
    }
  }, [memoizedConfig, controls, safeAnimate, transitionToState])

  // Cleanup timers on component unmount
  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts])

  return {
    state: currentState,
    isMouseOver,
    isAnimating,
    isLocked,
    isHardLocked,
    onHoverStart: (event, info) => dispatch('MOUSE_ENTER'),
    onHoverEnd: (event, info) => dispatch('MOUSE_LEAVE'),
    onAnimationComplete: (definition: AnimationDefinition) =>
      dispatch('ANIMATION_COMPLETE', {
        variant: typeof definition === 'string' ? definition : '',
      }),
    forceReset: () => dispatch('FORCE_RESET'),
    setLockState,
    unlock,
  }
}
