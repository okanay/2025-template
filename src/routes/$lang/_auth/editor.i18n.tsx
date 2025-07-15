import { createFileRoute } from '@tanstack/react-router'
import { EditFile } from 'src/features/editor/i18n-panel/pages/edit-file'

export const Route = createFileRoute('/$lang/_auth/editor/i18n')({
  component: EditFile,
})
