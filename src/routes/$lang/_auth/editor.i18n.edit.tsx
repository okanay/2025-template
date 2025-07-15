import { createFileRoute } from '@tanstack/react-router'
import { EditFile } from 'src/features/editor/i18n-panel/pages/edit'
import { EditFileStoreI18n } from 'src/features/editor/i18n-panel/pages/edit/store'
import { z } from 'zod/v4'

const searchSchema = z.object({
  lang: z.string().min(2).max(5),
  ns: z.string().min(1),
})

export const Route = createFileRoute('/$lang/_auth/editor/i18n/edit')({
  validateSearch: searchSchema.parse,
  component: () => {
    return (
      <EditFileStoreI18n>
        <EditFile />
      </EditFileStoreI18n>
    )
  },
})
