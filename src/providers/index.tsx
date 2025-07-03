import { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'
import { FramerProvider } from './framer'

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Toaster position="top-right" />
      <FramerProvider>{children}</FramerProvider>
    </>
  )
}
