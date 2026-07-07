# Midleo MQScout

Enterprise desktop explorer for IBM MQ queue managers. Built with **Electron 43**, **Angular 22**, and **Angular Material**.

## Prerequisites

- Node.js 22+
- Java runtime (for `midleo.jar`)
- IBM MQ client libraries (required by `midleo.jar`)

## Getting started

1. Download the latest `midleo.jar` from [GitLab](https://gitlab.com/vasilev.link/public/-/tree/master/java/midleo_mq) into `~/.midleo/`.
2. Install dependencies and build:

```bash
npm install
npm run build:dev:all
npm start
```

## Production release

```bash
npm run release        # package for current OS
npm run release:mac    # macOS DMG + zip
npm run release:win    # Windows NSIS installer
npm run release:linux  # AppImage + deb
```

Installers are written to `release-builds/`.

## Security

- Renderer runs with **context isolation** and **sandbox** enabled.
- IPC is restricted to an allowlisted `midleoApi` bridge.
- MQ commands execute via `execFile` (no shell interpolation).
- SSL passwords are encrypted at rest with Electron `safeStorage` when available.

## NPM scripts

| Command | Description |
| --- | --- |
| `npm run build:dev:all` | Development builds (renderer, main, preload) |
| `npm run build:prod:all` | Production builds |
| `npm run build:watch:all` | Watch mode for all targets |
| `npm run lint` | Angular lint |
| `npm run test` | Unit tests (headless Chrome) |
| `npm run release` | Production build + electron-builder package |

## License

GPL-3.0 — see [LICENSE](LICENSE).

## Troubleshooting

### White screen or `app.whenReady` crash

If `require('electron')` fails or the window stays white, check whether `ELECTRON_RUN_AS_NODE=1` is set in your environment (some IDE terminals set this). The `npm start` script unsets it on macOS/Linux. Run manually:

```bash
env -u ELECTRON_RUN_AS_NODE npm start
```

### npm `allowScripts` warnings

Dependency install scripts are gated by the `allowScripts` field in `package.json`. This repo approves the packages required for esbuild, Angular, and electron-builder. After pulling changes, run `npm install` once; no extra approval steps are needed.
