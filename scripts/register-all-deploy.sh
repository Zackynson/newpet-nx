#!/bin/env bash
set -u
: "$STACK_GLOB"
echo "Deploy $STACK_GLOB stacks"
echo "$STACK_GLOB" > .cdk-deploy-registered
