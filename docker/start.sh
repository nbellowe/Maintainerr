#!/bin/sh

PACKAGE_VERSION=$(node -p "require('/opt/app/apps/server/package.json').version")

SHORT_SHA=""
if [ -n "$GIT_SHA" ]; then
	SHORT_SHA=$(printf '%s' "$GIT_SHA" | cut -c1-7)
fi

case "${VERSION_TAG:-develop}" in
	develop|development)
		RUNTIME_VERSION="developer"
		;;
	*)
		RUNTIME_VERSION="${VERSION_TAG:-develop}"
		;;
esac

if [ -n "$SHORT_SHA" ]; then
	RUNTIME_VERSION="$RUNTIME_VERSION-$SHORT_SHA"
fi

printf '> @maintainerr/server@%s (%s) start\n' "$PACKAGE_VERSION" "$RUNTIME_VERSION"
printf '> node dist/main.js\n'

exec node /opt/app/apps/server/dist/main.js