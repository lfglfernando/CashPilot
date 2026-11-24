#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Use the local .NET SDK if available.
if [[ -x "$project_root/.tools/dotnet/dotnet" ]]; then
  export DOTNET_ROOT="$project_root/.tools/dotnet"
  export PATH="$DOTNET_ROOT:$PATH"
  dotnet_bin="$DOTNET_ROOT/dotnet"
elif command -v dotnet >/dev/null 2>&1; then
  dotnet_bin="$(command -v dotnet)"
else
  echo "Install the .NET 10 SDK first. See README.md for local setup." >&2
  exit 1
fi

# Keep SDK files and packages in .tools.
export DOTNET_CLI_HOME="$project_root/.tools/dotnet-home"
export NUGET_PACKAGES="${NUGET_PACKAGES:-$project_root/.tools/nuget}"
export DOTNET_CLI_TELEMETRY_OPTOUT=1
export DOTNET_GENERATE_ASPNET_CERTIFICATE=false

exec "$dotnet_bin" "$@"
