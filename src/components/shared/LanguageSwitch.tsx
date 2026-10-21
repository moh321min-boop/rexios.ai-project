import { useI18n } from '@/i18n'
export function LanguageSwitch() {
  const { language, setLanguage, t } = useI18n()
  return (
    <div
      className="language-switch border-ink bg-surface label flex overflow-hidden rounded-[4px] border-2"
      role="group"
      aria-label={t('language.select')}
    >
      <button
        type="button"
        lang="ar"
        aria-label="العربية"
        aria-pressed={language === 'ar'}
        onClick={() => setLanguage('ar')}
        className={`${language === 'ar' ? 'bg-accent' : ''} px-3 py-[6px]`}
      >
        عربي
      </button>
      <button
        type="button"
        lang="en"
        aria-label="English"
        aria-pressed={language === 'en'}
        onClick={() => setLanguage('en')}
        className={`${language === 'en' ? 'bg-accent' : ''} px-3 py-[6px]`}
      >
        EN
      </button>
    </div>
  )
}
