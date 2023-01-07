#!/bin/env bash
set -u
: "$STACK_PATH"
: "$STAGE"
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT="$SCRIPT_DIR/tsconfig.json"
echo "📝 Registering affected stack from project: $STACK_PATH"
npx ts-node -r tsconfig-paths/register --project $PROJECT -p -e "require('./scripts/cdk-class-to-project').cdkClassToProject('$STACK_PATH', true)" >> .cdk-deploy-registered
