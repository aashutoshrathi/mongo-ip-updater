# Mongo IP Updater

This is a simple extension to add or update your IP addresses into a [MongoDB Access List](https://www.mongodb.com/docs/atlas/security/ip-access-list/).

> **Note**
> This is for very very lazy and my kinda people, who don't want to do anything manually.

## Motivation 🤔

Unstable internet connection is already a pain, when you have to access some remote database from local setup, and your IP changes very often, it becomes a pain in the arse to update the MongoDB's allowed list of IP addresses.

This extension will help you to update your IP address in the access list with just one click.

## Installation

[link-chrome]: https://chrome.google.com/webstore/detail/mongo-ip-updater/cklilnpehpogpeoeklbefjbjafcnlofj 'Version published on Chrome Web Store'

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/chrome/chrome.svg" width="48" alt="Chrome" valign="middle">][link-chrome] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/cklilnpehpogpeoeklbefjbjafcnlofj.svg?label=%20">][link-chrome] and other Chromium browsers


### Development

- Get it locally -

  ```sh
  $ git clone https://github.com/aashutoshrathi/mongo-ip-updater.git
  ```

  **OR**

  Download the latest version here: [Mongo IP Updater ✨](https://github.com/aashutoshrathi/mongo-ip-updater/releases/latest)

- Go to `chrome://extensions/` & enable Developer Mode.
- Click on Load Unpacked Extension and Open/Select the folder.

### Releasing

Push a version tag matching `manifest.json` (for example, `v0.1.4`). The release
workflow creates a GitHub release, then the publish workflow packages the
extension, publishes it to the Chrome Web Store, and attaches the ZIP to the
release. A failed publish can be retried manually with its existing tag.

The `chrome-web-store` GitHub environment must define `CWS_CLIENT_ID`,
`CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN`, and `CRX_PRIVATE_KEY`.

## Demo 📺

![Mongo NAL Upsert Demo](https://s3.ap-south-1.amazonaws.com/shared.aashutosh.dev/ip-updater-0.1.0.gif)
