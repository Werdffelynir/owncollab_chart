# OwnCollab Chart

Place this app in **owncloud/apps/**

## Application Destination

The application is dependent for part of OwnCollab

- owncollab
- __owncollab_chart__
- owncollab_talks
- owncollab_calendar

Destination of application is displaying charts on the basis of the plugin dhtmlxgantt

## Dependency

For PDF generate: http://www.foolabs.com/xpdf/download.html

## Publish to App Store

First get an account for the [App Store](http://apps.owncloud.com/) then run:

    make appstore_package

The archive is located in build/artifacts/appstore and can then be uploaded to the App Store.

## Running tests
After [Installing PHPUnit](http://phpunit.de/getting-started.html) run:

    phpunit -c phpunit.xml
