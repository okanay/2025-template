import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/$lang/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$lang/about"!</div>
}
