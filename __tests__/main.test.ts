/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import { jest } from '@jest/globals'
import type { KitRelease } from '../src/types'

// Under ESM, module namespaces are read-only, so mocks must be registered with
// unstable_mockModule before the module under test is dynamically imported.
const getInputMock = jest.fn<(name: string) => string>()
const setOutputMock = jest.fn()
const setFailedMock = jest.fn()

jest.unstable_mockModule('@actions/core', () => ({
  getInput: getInputMock,
  setOutput: setOutputMock,
  setFailed: setFailedMock,
  info: jest.fn(),
  debug: jest.fn(),
  warning: jest.fn(),
  addPath: jest.fn()
}))

jest.unstable_mockModule('@actions/exec', () => ({
  exec: jest.fn()
}))

const fakeRelease: KitRelease = {
  tag: 'v1.0.0',
  name: 'latest',
  assets: []
}

const getReleasesMock =
  jest.fn<(token: string, latest: boolean) => Promise<KitRelease[]>>()
const findMatchingReleaseMock = jest.fn()

jest.unstable_mockModule('../src/releases/kit-release', () => ({
  getReleases: getReleasesMock,
  findMatchingRelease: findMatchingReleaseMock
}))

const downloadAndInstallMock =
  jest.fn<(release: KitRelease) => Promise<string>>()

jest.unstable_mockModule('../src/installer/install', () => ({
  downloadAndInstall: downloadAndInstallMock
}))

const main = await import('../src/main')

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getInputMock.mockImplementation(name =>
      name === 'version' ? 'latest' : 'fake-token'
    )
    getReleasesMock.mockResolvedValue([fakeRelease])
    downloadAndInstallMock.mockResolvedValue('/opt/kit/kit')
  })

  it('installs the resolved release and sets the kit-path output', async () => {
    await main.run()

    expect(getReleasesMock).toHaveBeenCalledWith('fake-token', true)
    expect(downloadAndInstallMock).toHaveBeenCalledWith(fakeRelease)
    expect(setOutputMock).toHaveBeenCalledWith('kit-path', '/opt/kit/kit')
    expect(setFailedMock).not.toHaveBeenCalled()
  })
})
