import {
  FileText,
  GitBranch,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Globe,
  Hash,
  ArrowRight,
  Edit3,
  Plus,
  Trash2,
} from 'lucide-react'
import { Link } from 'src/i18n/link'
import { useLanguage } from 'src/i18n/hooks/use-language'
import { useI18nSelect } from './store'
import { ns_dictionary } from 'src/messages/index'
import { SUPPORTED_LANGUAGES } from 'src/i18n/config'

export const SelectFilePage = () => {
  const { language } = useLanguage()
  const {
    draftStatus,
    changedFiles,
    isLoading,
    checkDraftStatus,
    publishChanges,
    restartChanges,
    isPublishing,
    isRestarting,
  } = useI18nSelect()

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-headline-large text-on-background">i18n Yönetim Paneli</h1>
          <p className="text-body-large text-on-surface-variant">
            Çeviri dosyalarınızı düzenleyin ve değişikliklerinizi yayınlayın
          </p>
        </header>

        {/* Draft Status Card */}
        <div className="mb-8 rounded-xl border border-outline/20 bg-surface p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  draftStatus === 'has-changes' ? 'bg-warning-container' : 'bg-success-container'
                }`}
              >
                {draftStatus === 'loading' ? (
                  <RefreshCw className="animate-spin text-on-surface-variant" size={24} />
                ) : draftStatus === 'has-changes' ? (
                  <AlertCircle className="text-on-warning-container" size={24} />
                ) : (
                  <CheckCircle className="text-on-success-container" size={24} />
                )}
              </div>

              <div>
                <h3 className="text-title-large text-on-surface">
                  {draftStatus === 'loading' && 'Durum kontrol ediliyor...'}
                  {draftStatus === 'none' && 'Tüm değişiklikler yayınlandı'}
                  {draftStatus === 'has-changes' && `${changedFiles.length} dosyada değişiklik var`}
                </h3>
                <p className="text-body-medium text-on-surface-variant">
                  {draftStatus === 'has-changes'
                    ? "Draft branch'inizde bekleyen değişiklikler bulunuyor"
                    : 'Şu anda bekleyen değişiklik bulunmuyor'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={checkDraftStatus}
                disabled={isLoading}
                className="btn-state-layer rounded-full p-3 text-on-surface-variant hover:bg-surface-container"
                title="Durumu Yenile"
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              </button>

              {draftStatus === 'has-changes' && (
                <>
                  <button
                    onClick={restartChanges}
                    disabled={isRestarting}
                    className="btn-state-layer inline-flex items-center gap-2 rounded-full bg-error-container px-6 py-3 text-label-large text-on-error-container"
                  >
                    <GitBranch size={16} />
                    {isRestarting ? 'Geri alınıyor...' : 'Değişiklikleri Geri Al'}
                  </button>
                  <button
                    onClick={publishChanges}
                    disabled={isPublishing}
                    className="btn-state-layer inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-label-large text-on-primary"
                  >
                    <CheckCircle size={16} />
                    {isPublishing ? 'Yayınlanıyor...' : 'Değişiklikleri Yayınla'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Changed Files Summary */}
          {draftStatus === 'has-changes' && changedFiles.length > 0 && (
            <div className="bg-warning-container/20 mt-6 rounded-lg p-4">
              <h4 className="mb-3 text-title-small text-on-surface">Değişen Dosyalar:</h4>
              <div className="flex flex-wrap gap-2">
                {changedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-label-small"
                  >
                    <ChangeStatusIcon status={file.status} />
                    <span className="text-on-surface">
                      {file.lang}/{file.ns}.json
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* File Selection Grid */}
        <div className="space-y-8">
          <h2 className="text-title-large text-on-surface">Düzenlenecek Dosyayı Seçin</h2>

          {SUPPORTED_LANGUAGES.map((lang) => (
            <div key={lang.value} className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="text-primary" size={24} />
                <h3 className="text-title-medium text-on-surface">{lang.label}</h3>
                <span className="rounded-full bg-surface-container px-3 py-1 text-label-medium text-on-surface-variant">
                  {lang.locale}
                </span>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
                {ns_dictionary.map((nsItem) => (
                  <FileCard
                    key={`${lang.value}-${nsItem.ns}`}
                    language={lang.value}
                    namespace={nsItem}
                    currentLang={language.value}
                    changeStatus={getFileChangeStatus(changedFiles, lang.value, nsItem.ns)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper functions
const getFileChangeStatus = (changedFiles: any[], lang: string, ns: string) => {
  return changedFiles.find((file) => file.lang === lang && file.ns === ns)?.status || null
}

const ChangeStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'added':
      return <Plus className="text-success" size={12} />
    case 'modified':
      return <Edit3 className="text-warning" size={12} />
    case 'deleted':
      return <Trash2 className="text-error" size={12} />
    default:
      return null
  }
}

// Enhanced File Card Component
const FileCard = ({
  language,
  namespace,
  currentLang,
  changeStatus,
}: {
  language: string
  namespace: (typeof ns_dictionary)[0]
  currentLang: string
  changeStatus: string | null
}) => {
  const getNamespaceIcon = (ns: string) => {
    switch (ns) {
      case 'translation':
        return BookOpen
      case 'common':
        return Hash
      case 'globals':
        return Globe
      default:
        return FileText
    }
  }

  const Icon = getNamespaceIcon(namespace.ns)
  const hasChanges = changeStatus !== null

  return (
    <Link
      to="/$lang/editor/i18n/edit"
      params={{ lang: currentLang }}
      search={{ lang: language, ns: namespace.ns }}
      className="group relative block"
    >
      {/* Change Indicator */}
      {hasChanges && (
        <div className="bg-warning text-on-warning absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full">
          <ChangeStatusIcon status={changeStatus} />
        </div>
      )}

      <div
        className={`rounded-xl border p-6 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 ${
          hasChanges ? 'border-warning/50 bg-warning-container/10' : 'border-outline/20 bg-surface'
        } hover:border-primary/30 hover:bg-surface-container`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                hasChanges ? 'bg-warning-container' : 'bg-primary-container'
              }`}
            >
              <Icon
                className={hasChanges ? 'text-on-warning-container' : 'text-on-primary-container'}
                size={24}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-title-medium text-on-surface group-hover:text-primary">
                  {namespace.label}
                </h4>
                {hasChanges && (
                  <span className="bg-warning-container text-on-warning-container rounded px-2 py-0.5 text-xs">
                    Değişiklik var
                  </span>
                )}
              </div>
              <p className="text-body-medium text-on-surface-variant">{namespace.ns}.json</p>
              <p className="text-body-small text-on-surface-variant">src/messages/{language}/</p>
            </div>
          </div>

          <ArrowRight
            className="text-on-surface-variant transition-transform group-hover:translate-x-1 group-hover:text-primary"
            size={20}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-surface-container">
            <span className="text-xs font-medium text-on-surface-variant">
              {language.toUpperCase()}
            </span>
          </div>

          <div className="h-1 w-1 rounded-full bg-outline" />

          <span className="text-label-small text-on-surface-variant">
            {hasChanges ? 'Değişiklik mevcut' : 'Düzenlemek için tıklayın'}
          </span>
        </div>
      </div>
    </Link>
  )
}
