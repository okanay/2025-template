import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { CustomNotFoundPage } from './routes/$lang/not-found'

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    basepath: '/',
    scrollRestoration: true,
    scrollRestorationBehavior: 'instant',
    defaultNotFoundComponent: CustomNotFoundPage,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
