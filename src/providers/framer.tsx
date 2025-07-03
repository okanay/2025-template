import { LazyMotion, domAnimation } from 'motion/react'

export const FramerProvider = ({ children }) => (
  <LazyMotion features={domAnimation}>{children}</LazyMotion>
)
