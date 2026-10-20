import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { problems } from '@/data/problems'
import { filterProblems } from '@/lib/problems'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Chip } from '@/components/ui/Chip'
import { FigmaIcon } from '@/components/ui/FigmaIcon'
import { DifficultyMark, ProblemCard, ProfileLink } from '@/components/problems/ProblemUI'
export function ProblemsPage() {
  const { user, permissions } = useAuth()
  const [params, setParams] = useSearchParams()
  const [banner, setBanner] = useState(true)
  const [more, setMore] = useState(false)
  const query = params.get('q') ?? '',
    difficulty = params.getAll('difficulty'),
    skills = params.getAll('skill'),
    sort = params.get('sort') ?? 'newest'
  const bound = (key: string, fallback: number) => {
    const raw = params.get(key)
    const n = raw === null ? fallback : Number(raw)
    return Number.isFinite(n) ? Math.min(200000, Math.max(10000, n)) : fallback
  }
  const min = bound('min', 10000),
    max = Math.max(min, bound('max', 200000))
  const found = filterProblems(problems, query, difficulty, skills, min, max, sort)
  function update(key: string, value: string) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true }
    )
  }
  function toggle(key: string, value: string) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev),
          values = next.getAll(key)
        next.delete(key)
        ;(values.includes(value) ? values.filter((x) => x !== value) : [...values, value]).forEach(
          (x) => next.append(key, x)
        )
        return next
      },
      { replace: true }
    )
  }
  function reset() {
    setParams(new URLSearchParams())
  }
  return (
    <div className="problems-page">
      <header>
        <h1 className="heading">Problems</h1>
        <p className="problem-subtitle">
          Real problems from Algerian companies — solve them and earn the reward.
        </p>
      </header>
      {banner && !permissions.canSubmitSolutions && user?.role !== 'industrial_company' && (
        <div className="problems-banner">
          <div className="problem-message warning">
            <FigmaIcon asset="0aee9" size={24} />
            <p>
              You can browse and discuss problems now. To submit a solution, complete your solver
              profile.
            </p>
            <button
              type="button"
              aria-label="Dismiss profile reminder"
              onClick={() => setBanner(false)}
            >
              ×
            </button>
          </div>
          <ProfileLink problem={problems[0]!} />
        </div>
      )}
      <div className="problem-stats">
        {[
          ['24', 'Open problems'],
          ['1,250,000 DZD', 'Total rewards'],
          ['18', 'Companies'],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="problems-list-grid">
        <aside className="problem-filters">
          <h2 className="section-title">Filter results</h2>
          <fieldset>
            <legend>Difficulty</legend>
            {(['Small', 'Medium', 'Expert'] as const).map((value) => (
              <label className="difficulty-option" key={value}>
                <input
                  className="checkbox"
                  type="checkbox"
                  checked={difficulty.includes(value)}
                  onChange={() => toggle('difficulty', value)}
                />
                <DifficultyMark value={value} />
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Skills</legend>
            <div className="problem-filter-skills">
              {['Python', 'C', 'IoT', 'AI / ML', 'Backend', 'SQL'].map((skill) => (
                <Chip
                  key={skill}
                  selected={skills.includes(skill)}
                  onClick={() => toggle('skill', skill)}
                >
                  {skill}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Reward range</legend>
            <div className="reward-sliders">
              <label className="sr-only" htmlFor="reward-min">
                Minimum reward
              </label>
              <input
                id="reward-min"
                type="range"
                min={10000}
                max={200000}
                step={1000}
                value={min}
                onChange={(e) => update('min', String(Math.min(Number(e.target.value), max)))}
              />
              <label className="sr-only" htmlFor="reward-max">
                Maximum reward
              </label>
              <input
                id="reward-max"
                type="range"
                min={10000}
                max={200000}
                step={1000}
                value={max}
                onChange={(e) => update('max', String(Math.max(Number(e.target.value), min)))}
              />
            </div>
            <div className="reward-labels">
              <span>{min.toLocaleString('en-US')} DZD</span>
              <span>{max.toLocaleString('en-US')} DZD</span>
            </div>
          </fieldset>
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </aside>
        <section className="problem-results" aria-label="Problems">
          <Input
            aria-label="Search problems"
            placeholder="Search for a problem, company or skill…"
            leftIcon={<FigmaIcon asset="9a614" size={20} />}
            value={query}
            onChange={(e) => update('q', e.target.value)}
          />
          <div className="problem-sort">
            {[
              ['newest', 'Newest'],
              ['reward', 'Highest reward'],
              ['ending', 'Ending soon'],
            ].map(([value, label]) => (
              <Chip key={value} selected={sort === value} onClick={() => update('sort', value!)}>
                {label!}
              </Chip>
            ))}
          </div>
          <p className="sr-only" role="status">
            {found.length} problems found
          </p>
          {found.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
          {!found.length && (
            <div className="problem-card">
              <h2 className="section-title">No matching problems</h2>
              <p>Try a different search or reset your filters.</p>
              <Button variant="secondary" onClick={reset}>
                Reset filters
              </Button>
            </div>
          )}
          {found.length > 0 && (
            <div className="problem-more">
              <Button variant="secondary" disabled={more} onClick={() => setMore(true)}>
                Show more problems
              </Button>
              {more && (
                <p role="status" className="caption text-muted">
                  Only four demo problems are available. Adjust filters to see the full set. No
                  additional records are connected.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
