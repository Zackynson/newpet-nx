# Infra Project Graph Plugin

This plugin is responsible for making sure all apps depend on the `infra` project. This is important because if anything changes in some of the resources stack, we re-deploy everyone to make sure nothing is left outdated. This is the same concept of adding a new package.

In this plugin we also avoid the dependency of the `infra` project to other apps since this is not needed. Such dependecy would only tell us that the `infra` is affected when other apps are affected, but this is obvious since we need to deploy every time any of the apps change.
