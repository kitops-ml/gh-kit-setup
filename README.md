<img width="1270" alt="KitOps" src="https://github.com/jozu-ai/kitops/assets/10517533/41295471-fe49-4011-adf6-a215f29890c2">

# Setup Kit CLI in GitHub Actions

This GitHub Action provides downloading and caching distribution of the
[Kit CLI](https://github.com/kitops-ml/kitops), and adding it to the PATH.

Please file issues in
[the main KitOps repository](https://github.com/kitops-ml/kitops).

## Simplify handoffs between data scientists, app devs, and DevOps

[![LICENSE](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](https://github.com/myscale/myscaledb/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/1098133460310294528?logo=Discord)](https://discord.gg/Tapeh8agYy)

[![Official Website](<https://img.shields.io/badge/-Visit%20the%20Official%20Website%20%E2%86%92-rgb(255,175,82)?style=for-the-badge>)](https://kitops.ml/?utm_source=github&utm_medium=kitops-readme)

### What is KitOps?

KitOps is your toolkit for transforming how you package, share, and deploy AI/ML
models. Say goodbye to compatibility concerns and hello to smooth AI/ML
collaboration.

KitOps simplifies the handoffs between data scientists, application developers,
and SREs working on self-hosted AI/ML models (including LLMs). KitOps' ModelKits
create a unified package for models, their dependencies, configurations, and
environments. The ModelKit is portable and uses open standards for compatibility
with the tools you already use.

<https://github.com/jozu-ai/kitops/assets/10517533/8f7539e1-b0d2-43c4-abfe-31841d4c68bd>

## Usage

See [action.yml](action.yml)

```YAML
- uses: jozu-ai/gh-kit-setup@v1.0.0
  with:
    # The version of Kit CLI to install. Defaults to `latest`
    version: v0.1.1
    # Used to pull kit CLI releases. Since there's a default, this is
    # typically not needed to be suplied.
    # When running this action on github.com, the default value is
    # sufficient.
    # When running on GHES, you can pass a personal access token
    # for github.com to avoid rate limiting.
    token: ''
```

### Basic

```YAML
steps:
  - uses: jozu-ai/gh-kit-setup@v1.0.0
    id: install_kit

  - name: Run kit command
    shell: bash
    run: |
      set -x
      kit version
```

### Pin a kit version

```YAML
steps:
  - uses: jozu-ai/gh-kit-setup@v1.0.0
    id: install_kit
    with:
      version: v0.1.1

  - name: Run kit command
    shell: bash
    run: |
      set -x
      kit version
```

#### Supported version syntax

The `version` input supports the Semantic Versioning Specification, for more
detailed examples please refer to
[the SemVer package documentation](https://github.com/npm/node-semver).

## Contributing

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org) handy (20.x or later should work!). If you are
> using a version manager like [`nodenv`](https://github.com/nodenv/nodenv) or
> [`nvm`](https://github.com/nvm-sh/nvm), the `.node-version` file at the root
> of the repository that will be used to automatically switch to the correct
> version when you `cd` into the repository. Additionally, this `.node-version`
> file is used by GitHub Actions in any `actions/setup-node` actions.

1. Clone this repository

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the TypeScript for distribution

   ```bash
   npm run bundle
   ```

1. :white_check_mark: Run the tests

   ```bash
   npm test
   ```

### Publishing a New Release

This project includes a helper script, [`script/release`](./script/release)
designed to streamline the process of tagging and pushing new releases for
GitHub Actions.

GitHub Actions allows users to select a specific version of the action to use,
based on release tags. This script simplifies this process by performing the
following steps:

1. **Retrieving the latest release tag:** The script starts by fetching the most
   recent release tag by looking at the local data available in your repository.
1. **Prompting for a new release tag:** The user is then prompted to enter a new
   release tag. To assist with this, the script displays the latest release tag
   and provides a regular expression to validate the format of the new tag.
1. **Tagging the new release:** Once a valid new tag is entered, the script tags
   the new release.
1. **Pushing the new tag to the remote:** Finally, the script pushes the new tag
   to the remote repository. From here, you will need to create a new release in
   GitHub and users can easily reference the new tag in their workflows.
