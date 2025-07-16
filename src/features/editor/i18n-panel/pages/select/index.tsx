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
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header className="space-y-3 text-center">
          <h1 className="text-display-small font-medium text-on-background">
            Çeviri Yönetim Paneli
          </h1>
          <p className="mx-auto max-w-2xl text-body-large text-on-surface-variant">
            Çeviri dosyalarını kolayca düzenleyin ve güncellemelerinizi yayınlayın
          </p>
        </header>

        {/* Draft Status Card */}
        <Card className="p-6" elevation={2}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <StatusIndicator status={draftStatus} isLoading={isLoading} />

              <div className="space-y-1">
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

            <ActionButtons
              draftStatus={draftStatus}
              isLoading={isLoading}
              isPublishing={isPublishing}
              isRestarting={isRestarting}
              onRefresh={checkDraftStatus}
              onPublish={publishChanges}
              onRestart={restartChanges}
            />
          </div>

          {/* Changed Files Summary */}
          {draftStatus === 'has-changes' && changedFiles.length > 0 && (
            <ChangedFilesSummary changedFiles={changedFiles} />
          )}
        </Card>

        {/* File Selection Section */}
        <div className="space-y-6">
          <div className="space-y-8">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <LanguageSection
                key={lang.value}
                language={lang}
                changedFiles={changedFiles}
                currentLang={language.value}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

//==========================================================================
// YARDIMCI BİLEŞENLER
//==========================================================================

const Card = ({
  children,
  className = '',
  elevation = 1,
}: {
  children: React.ReactNode
  className?: string
  elevation?: 0 | 1 | 2 | 3 | 4 | 5
}) => {
  return (
    <div className={`rounded-xl border border-outline-variant/20 bg-surface ${className}`}>
      {children}
    </div>
  )
}

const Button = ({
  children,
  onClick,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  className = '',
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'filled' | 'outlined' | 'text' | 'tonal'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  className?: string
}) => {
  const baseClasses =
    'btn-state-layer inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-disabled'

  const sizeClasses = {
    small: 'px-3 py-1.5 text-label-medium min-h-8',
    medium: 'px-6 py-2.5 text-label-large min-h-10',
    large: 'px-8 py-3 text-title-small min-h-12',
  }

  const variantClasses = {
    filled: 'bg-primary text-on-primary shadow-sm hover:shadow-md',
    outlined: 'border border-outline bg-surface text-primary hover:bg-primary-container/20',
    text: 'text-primary hover:bg-primary-container/20',
    tonal: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const StatusIndicator = ({ status, isLoading }: { status: string; isLoading: boolean }) => {
  const getStatusConfig = () => {
    if (isLoading) {
      return {
        bgClass: 'bg-surface-container',
        iconClass: 'text-on-surface-variant',
        icon: RefreshCw,
        spinning: true,
      }
    }

    switch (status) {
      case 'has-changes':
        return {
          bgClass: 'bg-warning-container',
          iconClass: 'text-on-warning-container',
          icon: AlertCircle,
          spinning: false,
        }
      default:
        return {
          bgClass: 'bg-success-container',
          iconClass: 'text-on-success-container',
          icon: CheckCircle,
          spinning: false,
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.bgClass}`}>
      <Icon className={`${config.iconClass} ${config.spinning ? 'animate-spin' : ''}`} size={24} />
    </div>
  )
}

const ActionButtons = ({
  draftStatus,
  isLoading,
  isPublishing,
  isRestarting,
  onRefresh,
  onPublish,
  onRestart,
}: {
  draftStatus: string
  isLoading: boolean
  isPublishing: boolean
  isRestarting: boolean
  onRefresh: () => void
  onPublish: () => void
  onRestart: () => void
}) => {
  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        variant="text"
        size="small"
        className="!rounded-full !p-3"
      >
        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
      </Button>

      {draftStatus === 'has-changes' && (
        <>
          <Button
            onClick={onRestart}
            disabled={isRestarting}
            variant="tonal"
            size="medium"
            className="bg-error-container text-on-error-container hover:bg-error-container/80"
          >
            <GitBranch size={16} />
            {isRestarting ? 'Geri alınıyor...' : 'Değişiklikleri Geri Al'}
          </Button>

          <Button onClick={onPublish} disabled={isPublishing} variant="filled" size="medium">
            <CheckCircle size={16} />
            {isPublishing ? 'Yayınlanıyor...' : 'Yayınla'}
          </Button>
        </>
      )}
    </div>
  )
}

const ChangedFilesSummary = ({ changedFiles }: { changedFiles: any[] }) => {
  return (
    <div className="mt-6 rounded-xl border border-tertiary-container/50 bg-tertiary-container/20 p-4">
      <h4 className="mb-3 text-title-small font-medium text-on-surface">Değişen Dosyalar:</h4>
      <div className="flex flex-wrap gap-2">
        {changedFiles.map((file, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container px-3 py-1.5"
          >
            <ChangeStatusIcon status={file.status} />
            <span className="text-label-medium text-on-surface">
              {file.lang}/{file.ns}.json
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const LanguageSection = ({
  language,
  changedFiles,
  currentLang,
}: {
  language: Language
  changedFiles: any[]
  currentLang: string
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div
          suppressContentEditableWarning
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high p-2"
          dangerouslySetInnerHTML={{ __html: language.icon }}
        />
        <div className="flex items-center gap-3">
          <h3 className="text-title-large font-medium text-on-surface">{language.label}</h3>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4">
        {ns_dictionary.map((nsItem) => (
          <FileCard
            key={`${language.value}-${nsItem.ns}`}
            language={language.value}
            namespace={nsItem}
            currentLang={currentLang}
            changeStatus={getFileChangeStatus(changedFiles, language.value, nsItem.ns)}
          />
        ))}
      </div>
    </div>
  )
}

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
  const Icon = getNamespaceIcon(namespace.ns)
  const hasChanges = changeStatus !== null
  const styling = getCardStyling(changeStatus)

  return (
    <Link
      to="/$lang/editor/i18n/edit"
      params={{ lang: currentLang }}
      search={{ lang: language, ns: namespace.ns }}
      className="group block"
    >
      <Card
        className={`p-6 transition-all duration-300 ${styling.borderClass} ${styling.bgClass} group-hover:border-primary/40 group-hover:elevated-3 group-hover:shadow-lg group-hover:shadow-primary/5 group-focus:ring-2 group-focus:ring-primary/20`}
        elevation={hasChanges ? 2 : 1}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-center gap-4">
            {/* Icon Container */}
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl ${styling.iconBgClass}`}
            >
              <Icon className={`${styling.iconTextClass}`} size={28} />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="text-title-medium font-medium text-on-surface transition-colors group-hover:text-primary">
                  {namespace.label}
                </h4>
                <ChangeStatusBadge status={changeStatus} />
              </div>

              <div className="space-y-1">
                <p className="font-mono text-body-medium text-on-surface-variant">
                  {namespace.ns}.json
                </p>
                <p className="text-body-small text-on-surface-variant/70">
                  src/messages/{language}/
                </p>
              </div>
            </div>
          </div>

          {/* Arrow & Status */}
          <div className="ml-2 flex flex-col items-center gap-3">
            <ArrowRight
              className="text-on-surface-variant transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110 group-hover:text-primary"
              size={24}
            />
            {hasChanges && <div className="bg-warning h-2 w-2 animate-pulse rounded-full" />}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-outline-variant/20 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-12 items-center justify-center rounded-md bg-surface-container-low">
              <span className="text-xs font-medium text-on-surface-variant">
                {language.toUpperCase()}
              </span>
            </div>

            {hasChanges && (
              <div className="flex items-center gap-1.5 text-on-surface-variant/70">
                <Clock size={12} />
                <span className="text-label-small">Yayınlanmayı bekliyor</span>
              </div>
            )}
          </div>

          <span className="text-label-small text-on-surface-variant">
            {hasChanges ? 'Değişiklikleri gör' : 'Düzenlemek için tıkla'}
          </span>
        </div>
      </Card>
    </Link>
  )
}

const ChangeStatusBadge = ({ status }: { status: string | null }) => {
  if (!status) return null

  const statusConfigs = {
    added: {
      icon: Plus,
      label: 'Yeni',
      className: 'bg-success-container text-on-success-container border-success/30',
    },
    modified: {
      icon: Edit3,
      label: 'Düzenlendi',
      className: 'bg-warning-container text-on-warning-container border-warning/30',
    },
    deleted: {
      icon: Trash2,
      label: 'Silindi',
      className: 'bg-error-container text-on-error-container border-error/30',
    },
  }

  const config = statusConfigs[status as keyof typeof statusConfigs]
  if (!config) return null

  const Icon = config.icon

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon size={12} />
      <span>{config.label}</span>
    </div>
  )
}

const ChangeStatusIcon = ({ status }: { status: string }) => {
  const icons = {
    added: <Plus className="text-success" size={12} />,
    modified: <Edit3 className="text-warning" size={12} />,
    deleted: <Trash2 className="text-error" size={12} />,
  }

  return icons[status as keyof typeof icons] || null
}

//==========================================================================
// HELPER FUNCTIONS
//==========================================================================

const getFileChangeStatus = (changedFiles: any[], lang: string, ns: string) => {
  return changedFiles.find((file) => file.lang === lang && file.ns === ns)?.status || null
}

const getNamespaceIcon = (ns: string) => {
  const icons = {
    translation: FileText,
    common: BookOpen,
    'error-pages': AlertCircle,
    default: Globe,
  }
  return icons[ns as keyof typeof icons] || icons.default
}

const getCardStyling = (changeStatus: string | null) => {
  if (!changeStatus) {
    return {
      borderClass: 'border-outline-variant/20',
      bgClass: 'bg-surface',
      iconBgClass: 'bg-primary-container',
      iconTextClass: 'text-on-primary-container',
    }
  }

  const stylings = {
    added: {
      borderClass: 'border-success/30',
      bgClass: 'bg-success-container/5',
      iconBgClass: 'bg-success-container',
      iconTextClass: 'text-on-success-container',
    },
    modified: {
      borderClass: 'border-warning/30',
      bgClass: 'bg-warning-container/5',
      iconBgClass: 'bg-warning-container',
      iconTextClass: 'text-on-warning-container',
    },
    deleted: {
      borderClass: 'border-error/30',
      bgClass: 'bg-error-container/5',
      iconBgClass: 'bg-error-container',
      iconTextClass: 'text-on-error-container',
    },
  }

  return (
    stylings[changeStatus as keyof typeof stylings] || {
      borderClass: 'border-outline-variant/20',
      bgClass: 'bg-surface',
      iconBgClass: 'bg-primary-container',
      iconTextClass: 'text-on-primary-container',
    }
  )
}
