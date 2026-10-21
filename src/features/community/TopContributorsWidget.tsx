import { t, useI18n } from '@/i18n'
import { MOCK_TOP_CONTRIBUTORS } from '@/data/mockData'
import { Avatar } from '@/components/ui/Avatar'
export function TopContributorsWidget() {
  useI18n()
  return (
    <section className="widget">
      <h2 className="section-title">{t('topContributorsWidget.top_contributors')}</h2>
      {MOCK_TOP_CONTRIBUTORS.map((c) => (
        <div key={c.id} className="flex items-center gap-[10px]">
          <Avatar name={c.displayName} />
          <div>
            <p className="label">{c.displayName}</p>
            <p className="caption text-muted">{t('counts.answers', { count: c.solutionCount })}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
