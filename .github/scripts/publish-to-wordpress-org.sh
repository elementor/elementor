#!/bin/bash
set -eo pipefail

if [[ -z "$SVN_USERNAME" ]]; then
	echo "Set the SVN_USERNAME secret"
	exit 1
fi

if [[ -z "$SVN_PASSWORD" ]]; then
	echo "Set the SVN_PASSWORD secret"
	exit 1
fi

if [[ -z "$PLUGIN_VERSION" ]]; then
	echo "Set the PLUGIN_VERSION env var"
	exit 1
fi

echo "Publish version: ${PLUGIN_VERSION}"

ELEMENTOR_PATH="$GITHUB_WORKSPACE/elementor"
SVN_PATH="$GITHUB_WORKSPACE/svn"

cd $ELEMENTOR_PATH
mkdir -p $SVN_PATH
cd $SVN_PATH

echo "Checkout from SVN"
svn co https://plugins.svn.wordpress.org/elementor/trunk

echo "Clean trunk folder"
cd $SVN_PATH/trunk
find . -maxdepth 1 -not -name ".svn" -not -name "." -not -name ".." -exec rm -rf {} +

echo "Copy files"
rsync -ah --progress $ELEMENTOR_PATH/* $SVN_PATH/trunk

echo "Preparing files"
cd $SVN_PATH/trunk

echo "svn delete"
svn status | grep -v '^.[ \t]*\\..*' | { grep '^!' || true; } | awk '{print $2}' | xargs -r svn delete;

echo "svn add"
svn status | grep -v '^.[ \t]*\\..*' | { grep '^?' || true; } | awk '{print $2}' | xargs -r svn add;

svn status

echo "Commit files to trunk"
svn ci -m "Upload v${PLUGIN_VERSION}" --no-auth-cache --non-interactive  --username "$SVN_USERNAME" --password "$SVN_PASSWORD"

echo "Copy files from trunk to tag ${PLUGIN_VERSION}"
svn cp https://plugins.svn.wordpress.org/elementor/trunk https://plugins.svn.wordpress.org/elementor/tags/${PLUGIN_VERSION} --message "Tagged ${PLUGIN_VERSION}" --no-auth-cache --non-interactive  --username "$SVN_USERNAME" --password "$SVN_PASSWORD"
svn update

echo "Remove the SVN folder from the workspace (for multiple releases in the same Action)"
rm -rf $SVN_PATH

echo "Back to the workspace root"
cd $GITHUB_WORKSPACE
