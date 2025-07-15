export const ModeButton: React.FC<{ isActive: boolean; onClick: () => void; label: string }> = ({
  isActive,
  onClick,
  label,
}) => (
  <button
    onClick={onClick}
    className={`rounded-full px-4 py-1 text-label-large transition-colors ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-on-surface/10'}`}
  >
    {label}
  </button>
)
