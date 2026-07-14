/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import { jest } from '@jest/globals'

// Mock the action's entrypoint. Under ESM this must be registered before the
// entrypoint is dynamically imported.
const runMock = jest.fn<() => Promise<void>>().mockResolvedValue()

jest.unstable_mockModule('../src/main', () => ({
  run: runMock
}))

describe('index', () => {
  it('calls run when imported', async () => {
    await import('../src/index')

    expect(runMock).toHaveBeenCalled()
  })
})
