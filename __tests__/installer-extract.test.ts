import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import { execSync } from 'child_process'

import * as installer from '../src/installer/install'

const extract = (
  installer as { extract: (archive: string, dest: string) => Promise<string> }
).extract as (archive: string, dest: string) => Promise<string>

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'kit-test-'))
}

describe('extract', () => {
  it('handles archives with files at root', async () => {
    const tmp = createTempDir()
    const archive = path.join(tmp, 'root.zip')
    const bin = path.join(tmp, 'kit')
    fs.writeFileSync(bin, 'test')
    execSync(`cd ${tmp} && zip -q root.zip kit`)
    const dest = path.join(tmp, 'out')
    fs.mkdirSync(dest)
    const out = await extract(archive, dest)
    expect(fs.existsSync(path.join(out, 'kit'))).toBe(true)
  })

  it('handles archives with top-level folder', async () => {
    const tmp = createTempDir()
    const folder = path.join(tmp, 'folder')
    fs.mkdirSync(folder)
    const bin = path.join(folder, 'kit')
    fs.writeFileSync(bin, 'test')
    execSync(`cd ${tmp} && zip -qr wrapped.zip folder`)
    const archive = path.join(tmp, 'wrapped.zip')
    const dest = path.join(tmp, 'out')
    fs.mkdirSync(dest)
    const out = await extract(archive, dest)
    expect(fs.existsSync(path.join(out, 'kit'))).toBe(true)
  })
})
