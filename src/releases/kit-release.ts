import * as core from '@actions/core'
import * as gh from '@actions/github'
import * as ghToolCache from '@actions/tool-cache'
import { KitRelease, KitArchiveFile } from '../types'

interface GitHubReleaseAsset {
  name: string
  browser_download_url: string
}

interface GitHubRelease {
  tag_name: string
  name: string | null
  assets?: GitHubReleaseAsset[]
}

export async function getReleases(
  token: string,
  latest: boolean
): Promise<KitRelease[]> {
  const octokit = gh.getOctokit(token)

  if (latest) {
    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/releases/latest',
      { owner: 'jozu-ai', repo: 'kitops' }
    )
    if (response.status !== 200) {
      core.warning(
        `Failed to retrieve latest release. Status code: ${response.status}`
      )
      throw new Error('Failed to retrieve latest release')
    }
    const r = response.data as GitHubRelease
    return [
      {
        tag: r.tag_name,
        name: r.name || r.tag_name,
        assets: (r.assets || []).map((a: GitHubReleaseAsset) => ({
          archiveFilename: a.name,
          archiveFileUrl: a.browser_download_url
        }))
      }
    ]
  }

  // Paginate all releases (max per_page=100)
  const releases: GitHubRelease[] = await octokit.paginate(
    'GET /repos/{owner}/{repo}/releases',
    { owner: 'jozu-ai', repo: 'kitops', per_page: 100 }
  )

  return releases.map((r: GitHubRelease) => ({
    tag: r.tag_name,
    name: r.name || r.tag_name,
    assets: (r.assets || []).map((a: GitHubReleaseAsset) => ({
      archiveFilename: a.name,
      archiveFileUrl: a.browser_download_url
    })) as KitArchiveFile[]
  }))
}

export function findMatchingRelease(
  releases: KitRelease[],
  version: string
): KitRelease | undefined {
  const selectedVersion = ghToolCache.evaluateVersions(
    releases.map(release => release.tag),
    version
  )
  return releases.find(release => release.tag === selectedVersion)
}
