import {
  FileText,
  GitBranch,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Globe,
  ArrowRight,
  Edit3,
  Plus,
  Trash2,
  Clock,
} from 'lucide-react'
import { Link } from 'src/i18n/link'
import { useLanguage } from 'src/i18n/hooks/use-language'
import { useI18nSelect } from './store'
import { ns_dictionary, TranslationNS } from 'src/messages/index'
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
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-headline-large text-on-background">Çeviri Yönetim Paneli</h1>
          <p className="text-body-large text-on-surface-variant">
            Çeviri dosyalarını kolayca düzenleyin ve güncellemelerinizi yayınlayın
          </p>
        </header>

        {/* Draft Status Card */}
        <div className="mb-8 rounded-xl border border-outline/20 bg-surface-container p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div
                className={`mt-1 flex h-12 w-12 items-start justify-center rounded-full ${
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
                    className="btn-state-layer inline-flex items-center gap-2 rounded-full bg-error-container px-6 py-3 text-label-medium text-on-error-container"
                  >
                    <GitBranch size={16} />
                    {isRestarting ? 'Geri alınıyor...' : 'Değişiklikleri Geri Al'}
                  </button>
                  <button
                    onClick={publishChanges}
                    disabled={isPublishing}
                    className="btn-state-layer inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-label-medium text-on-primary"
                  >
                    <CheckCircle size={16} />
                    {isPublishing ? 'Yayınlanıyor...' : 'Yayınla'}
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
                    className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1 text-label-small"
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

// Enhanced Change Status Component
const ChangeStatusBadge = ({ status }: { status: string | null }) => {
  if (!status) return null

  const statusConfig = {
    added: {
      icon: Plus,
      label: 'Yeni dosya',
      description: 'Bu dosya yeni eklendi',
      className: 'bg-success-container text-on-success-container border-success/30',
      iconClassName: 'text-success',
    },
    modified: {
      icon: Edit3,
      label: 'Düzenlendi',
      description: 'Bu dosyada değişiklikler var',
      className: 'bg-warning-container text-on-warning-container border-warning/30',
      iconClassName: 'text-warning',
    },
    deleted: {
      icon: Trash2,
      label: 'Silindi',
      description: 'Bu dosya silinmek üzere',
      className: 'bg-error-container text-on-error-container border-error/30',
      iconClassName: 'text-error',
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig]
  if (!config) return null

  const Icon = config.icon

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon size={12} className={config.iconClassName} />
      <span>{config.label}</span>
    </div>
  )
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
        return FileText
      case 'common':
        return BookOpen
      case 'error-pages':
        return AlertCircle
      default:
        return Globe
    }
  }

  const Icon = getNamespaceIcon(namespace.ns)
  const hasChanges = changeStatus !== null

  // Status-based styling
  const getCardStyling = () => {
    if (!hasChanges) {
      return {
        borderClass: 'border-outline/20',
        bgClass: 'bg-surface',
        iconBgClass: 'bg-primary-container',
        iconTextClass: 'text-on-primary-container',
      }
    }

    switch (changeStatus) {
      case 'added':
        return {
          borderClass: 'border-success/30',
          bgClass: 'bg-success-container/5',
          iconBgClass: 'bg-success-container',
          iconTextClass: 'text-on-success-container',
        }
      case 'modified':
        return {
          borderClass: 'border-warning/30',
          bgClass: 'bg-warning-container/5',
          iconBgClass: 'bg-warning-container',
          iconTextClass: 'text-on-warning-container',
        }
      case 'deleted':
        return {
          borderClass: 'border-error/30',
          bgClass: 'bg-error-container/5',
          iconBgClass: 'bg-error-container',
          iconTextClass: 'text-on-error-container',
        }
      default:
        return {
          borderClass: 'border-outline/20',
          bgClass: 'bg-surface',
          iconBgClass: 'bg-primary-container',
          iconTextClass: 'text-on-primary-container',
        }
    }
  }

  const styling = getCardStyling()

  return (
    <Link
      to="/$lang/editor/i18n/edit"
      params={{ lang: currentLang }}
      search={{ lang: language, ns: namespace.ns }}
      className="group relative block"
    >
      <div
        className={`rounded-xl border bg-surface-container p-6 transition-all duration-300 ${styling.borderClass} ${styling.bgClass} group-focus:ring-2 group-focus:ring-primary/20 hover:border-primary/30 hover:bg-surface-container hover:elevated-2 hover:shadow-lg hover:shadow-primary/5`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Enhanced Icon Container */}
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 ${styling.iconBgClass} group-hover:scale-105 group-hover:shadow-md`}
            >
              <Icon className={`${styling.iconTextClass} transition-all duration-300`} size={28} />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h4 className="text-title-large text-on-surface transition-colors duration-300 group-hover:text-primary">
                  {namespace.label}
                </h4>
                <ChangeStatusBadge status={changeStatus} />
              </div>

              <p className="text-body-medium text-on-surface-variant">{namespace.ns}.json</p>

              <p className="text-body-small text-on-surface-variant/70">src/messages/{language}/</p>
            </div>
          </div>

          {/* Enhanced Arrow */}
          <div className="flex flex-col items-center gap-2">
            <ArrowRight
              className="text-on-surface-variant transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110 group-hover:text-primary"
              size={24}
            />
            {hasChanges && <div className="flex h-2 w-2 rounded-full bg-current opacity-50" />}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-12 items-center justify-center rounded-md bg-surface-container">
              <span className="text-xs font-medium text-on-surface-variant">
                {language.toUpperCase()}
              </span>
            </div>

            {hasChanges && (
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-on-surface-variant/50" />
                <span className="text-label-small text-on-surface-variant/70">
                  Yayınlanmayı bekliyor
                </span>
              </div>
            )}
          </div>

          <span className="text-label-small text-on-surface-variant">
            {hasChanges ? 'Değişiklikleri gör' : 'Düzenlemek için tıkla'}
          </span>
        </div>
      </div>
    </Link>
  )
}
