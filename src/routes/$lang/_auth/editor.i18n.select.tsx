import { createFileRoute } from '@tanstack/react-router'
import { SelectFilePage } from 'src/features/editor/i18n-panel/pages/select'
import { SelectFileStoreI18n } from 'src/features/editor/i18n-panel/pages/select/store'

export const Route = createFileRoute('/$lang/_auth/editor/i18n/select')({
  component: () => {
    return (
      <SelectFileStoreI18n>
        <SelectFilePage />
      </SelectFileStoreI18n>
    )
  },
})
