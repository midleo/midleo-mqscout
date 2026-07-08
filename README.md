# Midleo MQScout

Open-source desktop explorer for IBM® MQ queue managers. Built with **Electron 43**, **Angular 22**, and **Angular Material**.

> MQScout is not affiliated with, endorsed by, or sponsored by IBM.

![MQScout queue overview](docs/images/mqscout-queue-overview.png)

## Overview

MQScout provides a desktop UI for browsing and working with IBM MQ queue managers. The open-source repository contains the Electron/Angular desktop application only.

The application expects separate Java runtime components to be present on the user’s machine. These Java components are **not included** in this repository and are **not bundled** in the installer.

## Prerequisites

* Node.js 22+
* Java 21+ runtime on `PATH`
* MQScout Java runtime files in `~/.midleo/`
* Access to an IBM MQ environment and any IBM MQ client software required by your organization’s IBM license terms

## Required runtime files

MQScout requires external Java artifacts that are not part of this open-source repository.

Place the files under `~/.midleo/`:

```text
~/.midleo/
  qmgrlist.json
  midleo.jar
  midleolibs/
    libs/                 # third-party Java libraries required by midleo.jar
    vendor/
      com.ibm.mq.allclient.jar
```

### `midleo.jar`

`midleo.jar` is a separate Midleo runtime component. It is not open-source, is not licensed under GPL-3.0, and is not included in this repository or in MQScout installers.

Obtain it separately from Midleo under the applicable Midleo license terms.

### IBM MQ client JAR

`com.ibm.mq.allclient.jar` is IBM MQ client software. It is not included in this repository or in MQScout installers.

Users must obtain IBM MQ client software from their own licensed IBM MQ installation, IBM’s published Maven artifacts, or IBM redistributable packages, subject to the applicable IBM license terms.

Do not commit, bundle, package, or redistribute IBM MQ client files with MQScout unless you have confirmed that your IBM license terms permit that distribution and you include all required IBM notices.

### Other Java libraries

Any additional Java libraries placed under `~/.midleo/midleolibs/libs/` remain subject to their own license terms.

Before distributing any build that includes Java libraries, verify license compatibility and include required third-party notices.

## Repository layout

```text
.
├── resources/             # documented runtime layout only; not bundled
├── src/                   # Angular renderer source
├── electron/              # Electron main/preload source
├── release-builds/        # generated installers
├── package.json
└── LICENSE
```

The `resources/` folder documents the expected runtime-file layout. It must not contain proprietary or third-party runtime JARs unless their licenses permit redistribution.

## Getting started

1. Install Node.js 22+.
2. Install Java 21+ and verify it is available:

```bash
java -version
```

3. Create the runtime directory:

```bash
mkdir -p ~/.midleo/midleolibs/libs
mkdir -p ~/.midleo/midleolibs/vendor
```

4. Place the required runtime files in `~/.midleo/`:

```text
~/.midleo/midleo.jar
~/.midleo/midleolibs/vendor/com.ibm.mq.allclient.jar
```

5. Install dependencies and start the app:

```bash
npm install
npm run build:dev:all
npm start
```

## Development

```bash
npm run build:dev:all
npm start
```

For watch mode:

```bash
npm run build:watch:all
```

## Production release

The production installer contains only the Electron/Angular MQScout desktop application.

It does **not** include:

* `midleo.jar`
* `com.ibm.mq.allclient.jar`
* IBM MQ runtime files
* proprietary Java artifacts

Build installers with:

```bash
npm run release        # package for current OS
npm run release:mac    # macOS DMG + zip
npm run release:win    # Windows NSIS installer
npm run release:linux  # AppImage + deb
```

Installers are written to:

```text
release-builds/
```

## Security

* Renderer runs with **context isolation** and **sandbox** enabled.
* IPC is exposed only through an allowlisted `midleoApi` preload bridge.
* Java/MQ commands are executed with `execFile` and do not use shell interpolation.
* SSL passwords are encrypted at rest with Electron `safeStorage` when available.
* MQScout does not download or install IBM MQ client software automatically.

## NPM scripts

| Command                   | Description                                       |
| ------------------------- | ------------------------------------------------- |
| `npm run build:dev:all`   | Build renderer, main, and preload for development |
| `npm run build:prod:all`  | Build renderer, main, and preload for production  |
| `npm run build:watch:all` | Watch mode for all build targets                  |
| `npm run lint`            | Run Angular linting                               |
| `npm run test`            | Run unit tests in headless Chrome                 |
| `npm run release`         | Production build and electron-builder package     |

## License

This repository is licensed under **GPL-3.0**. See [LICENSE](LICENSE).

The GPL-3.0 license applies to the source code and binaries built from this repository. It does not grant rights to IBM MQ, `com.ibm.mq.allclient.jar`, `midleo.jar`, or any other separately supplied proprietary or third-party runtime components.

If you distribute modified versions of MQScout, you are responsible for complying with GPL-3.0 and with all applicable third-party dependency licenses.

## Trademark notice

IBM and IBM MQ are trademarks or registered trademarks of International Business Machines Corporation in the United States, other countries, or both.

Other product and service names may be trademarks of their respective owners.

## Troubleshooting

### White screen or `app.whenReady` crash

If `require('electron')` fails or the window stays white, check whether `ELECTRON_RUN_AS_NODE=1` is set in your environment. Some IDE terminals set this variable.

Run:

```bash
npm start
```

### Missing `midleo.jar`

Verify that this file exists:

```text
~/.midleo/midleo.jar
```

If it is missing, obtain it separately from Midleo under the applicable license terms.

### Missing IBM MQ client JAR

Verify that this file exists:

```text
~/.midleo/midleolibs/vendor/com.ibm.mq.allclient.jar
```

This file must be supplied by the user from an IBM-authorized source and used according to the applicable IBM license terms.

### Java / MQ connection errors

Check:

```bash
java -version
```

Ensure Java 21+ is installed and available on `PATH`.

Then verify that the runtime layout matches:

```text
~/.midleo/
  qmgrlist.json
  midleo.jar
  midleolibs/
    libs/
    vendor/
      com.ibm.mq.allclient.jar
```

### npm `allowScripts` warnings

Dependency install scripts are gated by the `allowScripts` field in `package.json`.

After pulling changes, run:

```bash
npm install
```

No additional approval steps should be required unless dependencies changed.
