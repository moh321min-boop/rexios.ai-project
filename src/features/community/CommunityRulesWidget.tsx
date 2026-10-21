import { t, useI18n } from '@/i18n'
import { MOCK_COMMUNITY_RULES } from '@/data/mockData'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
export function CommunityRulesWidget() {
  useI18n()
  return (
    <section className="widget">
      <h2 className="section-title">{t('communityRulesWidget.community_rules')}</h2>
      {MOCK_COMMUNITY_RULES.map((rule) => (
        <p key={rule} className="text-muted flex items-start gap-2 text-[14px] leading-[1.55]">
          <FigmaIcon asset="311b1" size={18} />
          {t(rule)}
        </p>
      ))}
    </section>
  )
}
