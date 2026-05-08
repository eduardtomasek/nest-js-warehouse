#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

usage() {
  cat <<'EOF'
Usage:
  scripts/publish-npm.sh <patch|minor|major|version> [npm publish args...]

Examples:
  scripts/publish-npm.sh patch
  scripts/publish-npm.sh minor
  scripts/publish-npm.sh major
  scripts/publish-npm.sh 2.5.7
  scripts/publish-npm.sh patch --tag beta
EOF
}

if [[ $# -lt 1 ]]; then
  usage >&2
  exit 1
fi

VERSION_BUMP="$1"
shift

PACKAGE_NAME="$(npm pkg get name | tr -d '"')"

if [[ -z "$PACKAGE_NAME" ]]; then
  echo "Unable to read package name from package.json." >&2
  exit 1
fi

if [[ -n "$(git status --short)" ]]; then
  echo "Working tree is not clean. Commit or stash changes before publishing." >&2
  exit 1
fi

if ! npm whoami >/dev/null 2>&1; then
  echo "You are not logged in to npm. Run 'npm login' first." >&2
  exit 1
fi

echo "Bumping version with: npm version ${VERSION_BUMP}"
npm version "$VERSION_BUMP"

PACKAGE_VERSION="$(npm pkg get version | tr -d '"')"

if [[ -z "$PACKAGE_VERSION" ]]; then
  echo "Unable to read package version from package.json after version bump." >&2
  exit 1
fi

echo "Prepared ${PACKAGE_NAME}@${PACKAGE_VERSION}"

echo "Running tests..."
npm test

echo "Building package..."
npm run build

echo "Checking package contents..."
npm pack >/dev/null

echo "Publishing to npm..."
npm publish --access public "$@"

echo "Published ${PACKAGE_NAME}@${PACKAGE_VERSION}"
