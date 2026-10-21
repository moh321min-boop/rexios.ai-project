import { t, useI18n } from '@/i18n'
import { MOCK_CATEGORIES } from '@/data/mockData'
export function CategoriesSidebar({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: string
  onSelectCategory: (id: string) => void
}) {
  useI18n()
  return (
    <section className="widget categories">
      <h2 className="section-title">{t('categoriesSidebar.categories')}</h2>
      <nav aria-label={t('categoriesSidebar.question_categories')}>
        {MOCK_CATEGORIES.map((c) => (
          <button
            type="button"
            key={c.id}
            aria-pressed={c.id === selectedCategory}
            className={c.id === selectedCategory ? 'selected' : ''}
            onClick={() => onSelectCategory(c.id)}
          >
            <span>{t(c.name)}</span>
            <span className="caption text-muted">{c.questionCount}</span>
          </button>
        ))}
      </nav>
    </section>
  )
}
