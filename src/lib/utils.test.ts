import { describe, it, expect } from 'vitest'
import {
  cn,
  formatRelativeTime,
  formatCount,
  getInitials,
  slugify,
  isValidGithubUrl,
} from './utils'

describe('utils library', () => {
  describe('cn (Tailwind merge)', () => {
    it('merges class names safely', () => {
      expect(cn('px-2 py-1', 'bg-white')).toBe('px-2 py-1 bg-white')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })
  })

  describe('formatCount', () => {
    it('formats numbers under 1000 without suffix', () => {
      expect(formatCount(0)).toBe('0')
      expect(formatCount(842)).toBe('842')
    })

    it('formats thousands with k suffix', () => {
      expect(formatCount(1200)).toBe('1.2k')
      expect(formatCount(25000)).toBe('25k')
    })

    it('formats millions with M suffix', () => {
      expect(formatCount(1500000)).toBe('1.5M')
    })
  })

  describe('getInitials', () => {
    it('extracts two uppercase initials', () => {
      expect(getInitials('Alex Chen')).toBe('AC')
      expect(getInitials('Sarah Lin')).toBe('SL')
      expect(getInitials('Robotics')).toBe('R')
    })
  })

  describe('slugify', () => {
    it('generates URL safe slug', () => {
      expect(slugify('PLC & Automation')).toBe('plc-automation')
      expect(slugify('ROS2 Humble Hawksbill')).toBe('ros2-humble-hawksbill')
    })
  })

  describe('isValidGithubUrl', () => {
    it('validates repository URLs correctly', () => {
      expect(isValidGithubUrl('https://github.com/organization/repo')).toBe(true)
      expect(isValidGithubUrl('https://gitlab.com/organization/repo')).toBe(false)
      expect(isValidGithubUrl('invalid-url')).toBe(false)
    })
  })

  describe('formatRelativeTime', () => {
    it('returns recent time description', () => {
      const now = new Date().toISOString()
      expect(formatRelativeTime(now)).toBe('just now')
    })
  })
})
