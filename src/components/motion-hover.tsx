import { useAnimationControls, Variants } from 'motion/react'
import * as m from 'motion/react-m'
import { useMotionHover } from 'src/hooks/use-motion-hover'

const cardVariants: Variants = {
  initial: {},
  hover: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
  exit: {},
}

const frameVariants: Variants = {
  initial: { scale: 1, x: 0, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  hover: { scale: 1.05, x: 10, y: 5, transition: { duration: 0.3, ease: 'easeInOut' } },
  exit: { scale: 0.8, x: -40, y: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
}

const contentVariants: Variants = {
  initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  hover: { x: -15, y: -10, transition: { duration: 0.5, ease: 'easeInOut' } },
  exit: { x: 0, y: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
}

const textVariants: Variants = {
  initial: { y: 20, opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  hover: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.25, ease: 'easeInOut' } },
}

const particleVariants: Variants = {
  initial: { scale: 0, opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  hover: {
    scale: [1, 1.5, 1.2, 2, 1],
    opacity: [0, 1, 1, 1, 0],
    transition: {
      duration: 2,
      times: [0, 0.25, 0.5, 0.75, 1],
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
}

export const MotionHover = () => {
  const controls = useAnimationControls()
  const hover = useMotionHover(controls, {
    initialVariant: 'initial',
    hoverVariant: 'hover',
    exitVariant: 'exit',
    hoverIntentMs: 450,
    restartDelayMs: 150,
    exitToIdle: 'animate',
  })

  return (
    <div className="flex w-full items-center justify-center p-8">
      <m.div
        className="relative h-80 w-80 cursor-pointer rounded-3xl elevated-2"
        variants={cardVariants}
        animate={controls}
        onHoverStart={hover.onHoverStart}
        onHoverEnd={hover.onHoverEnd}
        onAnimationComplete={hover.onAnimationComplete}
        initial="initial"
      >
        <m.div
          className="absolute inset-0 rounded-3xl border border-outline bg-surface-container-high"
          variants={frameVariants}
        />
        {[
          { top: '10%', left: '15%' },
          { top: '75%', left: '12%' },
          { top: '30%', left: '80%' },
          { top: '65%', left: '88%' },
          { top: '20%', left: '25%' },
          { top: '85%', left: '18%' },
          { top: '35%', left: '78%' },
          { top: '70%', left: '92%' },
          { top: '45%', left: '55%' },
        ].map((pos, i) => (
          <m.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-secondary-container"
            style={pos}
            variants={particleVariants}
          />
        ))}
        <m.div
          className="relative z-10 flex h-full flex-col items-center justify-center p-8 text-center"
          variants={contentVariants}
        >
          <m.h3 className="text-2xl font-bold text-on-surface" variants={textVariants}>
            Performant Core
          </m.h3>
          <m.p className="mt-2 text-on-surface-variant" variants={textVariants}>
            GPU-accelerated transforms and opacity only.
          </m.p>
        </m.div>
      </m.div>
    </div>
  )
}
