# Add to Miniflux Firefox Extension Privacy Policy

**Last updated:** July 5, 2026

## Overview

The Add to Miniflux Firefox extension is a companion tool for self-hosted Miniflux instances. It lets users discover feeds from the current browser tab and add selected feeds to their own Miniflux server.

## Data Collection

The extension handles the following data:

- Authentication information: a Miniflux API token provided by the user is stored in `chrome.storage.sync` and used only to authenticate requests to the user's Miniflux instance.
- Website content: when the user opens the extension popup, the URL of the active tab is read and pre-filled into the form. The URL is sent to the user's Miniflux instance only when the user clicks to discover feeds.
- User configuration: the user's Miniflux base URL is stored in `chrome.storage.sync`.
- Feed choices: selected feed URLs, selected category IDs, optional custom names, and the mark-as-read preference are sent only to the configured Miniflux instance when the user adds a feed.

## Data Storage

All extension settings are stored locally in the user's browser via `chrome.storage.sync`. If the user has browser sync enabled, this data may sync across their browser installations according to the browser's sync behavior.

## Data Sharing

The extension does not sell, transfer, or share user data with third parties. It does not collect analytics, telemetry, browsing history, or advertising data. It communicates only with the Miniflux instance configured by the user.

## Changes

Updates to this privacy policy will be reflected in this document with an updated date.
