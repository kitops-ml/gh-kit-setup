import * as ghCore from '@actions/core'
import * as ghIO from '@actions/io'
import * as ghToolCache from '@actions/tool-cache'
import path from 'path'
import * as fs from 'fs'
import { KitArchiveFile, KitRelease } from '../types'
import { downloadFile } from './download'
import {
  getArch,
  getExecutableBinaryName,
  getOS,
  getTmpDir
} from '../utils/utils'
import { verifyHash } from './hash'

export async function downloadAndInstall(release: KitRelease): Promise<string> {
  ghCore.debug(`Downloading and installing release ${release.tag}`)
  const files = release.assets
    .filter(filterAssetsByOS)
    .filter(filterAssetsByArch)
  if (files.length === 0) {
    throw new Error(`No matching release found for ${getOS()} and ${getArch()}`)
  }
  const file = files[0]
  const downloadPath = await downloadFile(file)
  const checksum = release.assets.find(asset =>
    asset.archiveFilename.includes('checksums')
  ) as KitArchiveFile
  await verifyHash(downloadPath, checksum)
  const dir = await getExecutableTargetDir()
  const finalPath = await extract(downloadPath, dir)
  const finalExecPath = path.join(finalPath, getExecutableBinaryName())
  const chmod = '755'
  ghCore.debug(`chmod ${chmod} ${finalExecPath}`)
  await fs.promises.chmod(finalExecPath, chmod)
  return finalExecPath
}

export async function getExecutableTargetDir(): Promise<string> {
  let parentDir

  const tmpDir = getTmpDir()
  if (tmpDir) {
    ghCore.info('Using temporary directory for storage')
    parentDir = tmpDir
  } else {
    ghCore.info('Using CWD for storage')
    parentDir = process.cwd()
  }
  const targetDir = path.join(parentDir, 'jozu-bin')

  await ghIO.mkdirP(targetDir)
  ghCore.info(`CLIs will be downloaded to ${targetDir}`)
  ghCore.addPath(targetDir)
  ghCore.info(`Added ${targetDir} to PATH`)

  return targetDir
}

export async function extract(archive: string, dest: string): Promise<string> {
  const basename = path.basename(archive)
  const extname = path.extname(basename)
  let extractedDir: string

  ghCore.debug(`Extracting ${basename} to ${dest}`)

  if (extname === '.zip') {
    extractedDir = await ghToolCache.extractZip(archive, dest)
  } else if (basename.endsWith('.tar.gz') || basename.endsWith('.tgz')) {
    extractedDir = await ghToolCache.extractTar(archive, dest)
  } else {
    throw new Error(
      `No way to extract ${archive}:
         Unknown file type "${basename}" - Supported formats are .zip and .tar.gz`
    )
  }

  ghCore.debug(`Archive extracted to: ${extractedDir}`)

  const binName = getExecutableBinaryName()
  ghCore.debug(`Looking for executable: ${binName}`)

  const directPath = path.join(extractedDir, binName)
  try {
    await fs.promises.access(directPath, fs.constants.F_OK)
    ghCore.debug(`Found executable at root: ${directPath}`)
    return extractedDir
  } catch {
    // File doesn't exist, continue with fallback logic
    ghCore.debug(`Executable not found at root, trying fallback methods`)
  }

  const entries = await fs.promises.readdir(extractedDir)
  if (entries.length === 1) {
    const maybeDir = path.join(extractedDir, entries[0])
    const candidate = path.join(maybeDir, binName)
    try {
      const stat = await fs.promises.stat(maybeDir)
      if (stat.isDirectory()) {
        await fs.promises.access(candidate, fs.constants.F_OK)
        return maybeDir
      }
    } catch {
      // Directory doesn't exist or candidate file not found, continue
    }
  }

  const found = await findFileRecursive(extractedDir, binName)
  if (found) {
    return path.dirname(found)
  }

  return extractedDir
}

async function findFileRecursive(
  dir: string,
  target: string
): Promise<string | undefined> {
  const stat = await fs.promises.stat(dir)
  if (stat.isFile() && path.basename(dir) === target) {
    return dir
  }
  if (!stat.isDirectory()) {
    return undefined
  }

  const entries = await fs.promises.readdir(dir)
  for (const entry of entries) {
    const res = await findFileRecursive(path.join(dir, entry), target)
    if (res) {
      return res
    }
  }
  return undefined
}

function filterAssetsByOS(file: KitArchiveFile): boolean {
  const os = getOS()
  const lowerCaseFilename = file.archiveFilename.toLowerCase()
  return lowerCaseFilename.includes(os)
}

function filterAssetsByArch(file: KitArchiveFile): boolean {
  const arch = getArch()
  const lowerCaseFilename = file.archiveFilename.toLowerCase()
  return lowerCaseFilename.includes(arch)
}
