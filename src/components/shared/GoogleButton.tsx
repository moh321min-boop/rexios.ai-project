import { t, useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
export function GoogleButton({ children, onClick }: { children: string; onClick: () => void }) {
  useI18n()
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="h-12 w-full gap-[10px]"
      leftIcon={
        <span className="flex size-[22px] items-center justify-center">
          <img src="/figma/026a0.svg" alt="" width="17" height="16.5" />
        </span>
      }
    >
      {children}
    </Button>
  )
}
export function EmailDivider() {
  useI18n()
  return (
    <div className="flex w-full items-center gap-3">
      <span className="bg-subtle h-[2px] flex-1" />
      <span className="caption text-muted">{t('googleButton.or_with_email')}</span>
      <span className="bg-subtle h-[2px] flex-1" />
    </div>
  )
}
