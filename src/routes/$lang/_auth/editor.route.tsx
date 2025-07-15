import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/$lang/_auth/editor')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
