# Add to Miniflux

Browser extension for Chrome and Firefox that discovers feeds from the current tab and adds them to your self-hosted [Miniflux](https://miniflux.app/) instance.

Links:

- [Chrome Extension](https://chromewebstore.google.com/detail/add-to-miniflux/adeikjaciojkhlcdjlmfgemlpognlodi)
- [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/add-to-miniflux-ext/)

## Features

- Discover RSS/Atom feeds from the current page
- Choose which feed to add when a page exposes multiple subscriptions
- Select a Miniflux category before adding the feed
- Optionally set a custom feed title
- Optionally mark all entries in the newly added feed as read
- Stores only your Miniflux URL and API token in browser sync storage

## Setup

1. Create a Miniflux API key in Miniflux under **Settings > API Keys**.
2. Install the extension in Chrome or Firefox.
3. Open the extension settings.
4. Enter your Miniflux base URL, for example `https://miniflux.example.com`.
5. Enter your API token.

You can include or omit `/v1` in the base URL. The extension normalizes it before making API requests.

## Development

Run checks:

```bash
just check
```

Package an extension:

```bash
just release-extension chrome
just release-extension firefox
```

The release script writes ZIP files to `dist/`.
