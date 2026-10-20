import { MOCK_TAGS } from '@/data/mockData'
import { Tag } from '@/components/ui/Tag'
export function PopularTagsWidget({
  onTagSelect,
  selectedTag,
}: {
  onTagSelect: (slug: string) => void
  selectedTag?: string | null
}) {
  return (
    <section className="widget">
      <h2 className="section-title">Popular tags</h2>
      <div className="flex flex-wrap gap-2">
        {MOCK_TAGS.map((tag, i) => (
          <Tag
            key={tag.id}
            name={tag.name}
            selected={selectedTag === tag.slug}
            neutral={[1, 4, 5].includes(i)}
            onClick={() => onTagSelect(tag.slug)}
          />
        ))}
      </div>
    </section>
  )
}
