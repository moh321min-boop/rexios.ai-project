import { t, useI18n } from '@/i18n'
import { useAuth } from '@/context/AuthContext'
import { useCommunity } from '@/context/CommunityContext'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
export function Reactions({
  id,
  helpful,
  insight,
}: {
  id: string
  helpful: number
  insight: number
}) {
  useI18n()
  const { isAuthenticated, triggerAuthPrompt } = useAuth()
  const { reactions, toggleReaction } = useCommunity()
  return (
    <div className="reactions">
      {[
        { name: 'Helpful', asset: 'd60f2', count: helpful },
        { name: 'Insight', asset: '7a46e', count: insight },
      ].map((item) => {
        const key = `${id}:${item.name}`
        const active = isAuthenticated && !!reactions[key]
        return (
          <button
            type="button"
            key={key}
            aria-pressed={active}
            aria-label={`${t(item.name)} ${item.count + (active ? 1 : 0)}`}
            className={`reaction ${active ? 'reaction-active' : ''}`}
            onClick={() => (isAuthenticated ? toggleReaction(key) : triggerAuthPrompt())}
          >
            <FigmaIcon asset={item.asset} size={18} />
            <span>{t(item.name)}</span>
            <span>{item.count + (active ? 1 : 0)}</span>
          </button>
        )
      })}
    </div>
  )
}
