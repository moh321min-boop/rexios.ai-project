import { MOCK_TOP_CONTRIBUTORS } from '@/data/mockData'
import { Avatar } from '@/components/ui/Avatar'
export function TopContributorsWidget() {
  return (
    <section className="widget">
      <h2 className="section-title">Top contributors</h2>
      {MOCK_TOP_CONTRIBUTORS.map((c) => (
        <div key={c.id} className="flex items-center gap-[10px]">
          <Avatar name={c.displayName} />
          <div>
            <p className="label">{c.displayName}</p>
            <p className="caption text-muted">{c.solutionCount} answers</p>
          </div>
        </div>
      ))}
    </section>
  )
}
