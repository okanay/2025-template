import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$lang/_auth/editor/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$lang/_auth/editor/"!</div>
}
