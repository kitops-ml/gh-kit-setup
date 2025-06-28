import { findMatchingRelease, getReleases } from '../src/releases/kit-release'
import { getToken } from './test-utils'

describe('getReleases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should retrieve releases successfully', async () => {
    const token = getToken()
    if (!token) {
      console.warn('Skipping test: requires GITHUB_TOKEN')
      return
    }
    const release = await getReleases(token, false)
    expect(release).toBeDefined()
    expect(release.length).toBeGreaterThan(0)
  })

  it('should retrieve latest release successfully', async () => {
    const token = getToken()
    if (!token) {
      console.warn('Skipping test: requires GITHUB_TOKEN')
      return
    }
    const release = await getReleases(token, true)
    expect(release).toBeDefined()
    expect(release.length).toBe(1)
  })

  it('should find matching release', async () => {
    const token = getToken()
    if (!token) {
      console.warn('Skipping test: requires GITHUB_TOKEN')
      return
    }
    const releases = await getReleases(token, false)
    const matchingRelease = findMatchingRelease(releases, 'v0.1.0')
    expect(matchingRelease).toBeDefined()
    expect(matchingRelease?.tag).toBe('v0.1.0')
  })
})
