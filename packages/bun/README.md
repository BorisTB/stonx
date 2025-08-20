# @stonx/bun — Nx plugin for Bun

[![npm version](https://img.shields.io/npm/v/@stonx/bun.svg)](https://www.npmjs.com/package/@stonx/bun)
[![license: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Nx compatibility](https://img.shields.io/badge/Nx-%E2%89%A520%20%E2%89%A4%2021-blue)](https://nx.dev)
[![CI](https://github.com/BorisTB/stonx/actions/workflows/ci.yml/badge.svg)](https://github.com/BorisTB/stonx/actions)

Nx plugin adding support for [Bun](https://bun.sh/).

## Features

- Generators
  - application: scaffold a Bun application (with Nx targets preconfigured)
  - init: initialize the plugin in your workspace
- Executors
  - build: build an application using Bun
  - run: execute an application using Bun (with watch support)

## Add the plugin to an existing Nx workspace

### Recommended

```bash
nx add @stonx/bun
```

This installs the plugin and performs any required setup in your workspace.

### Fallback (manual)

```bash
npm i -D @stonx/bun
```

Note: Manual installation may require compatible peer dependencies.

## Generators

### init <kbd>Internal</kbd>

Initialize the `@stonx/bun` plugin.

### application
Generate a Bun application within your Nx workspace.

```shell
nx g @stonx/bun:app
```

## Executors

### build

Build an application using Bun.

```json
{
  "build": {
    "executor": "@stonx/bun:build",
    "options": {
      "outputPath": "dist/libs/ts-lib",
      "main": "libs/ts-lib/src/index.ts",
      "tsConfig": "libs/ts-lib/tsconfig.lib.json",
      "smol": false,
      "bun": true
    }
  }
}
```

### run

Run an application using Bun.

```json
{
  "my-app": {
    "targets": {
      "serve": {
        "executor": "@stonx/bun:run",
        "options": {},
        "configurations": {
          "development": {
            // Just serve the main file without building it
            "main": "apps/my-app/src/main.ts"
          },
          "production": {
            // Build app and then run the built main file
            "buildTarget": "my-app:build"
          }
        }
      },
      "build": {
        "executor": "@stonx/bun:build",
        "options": {
          "main": "apps/my-app/src/main.ts",
          // ...
        }
      }
    }
  }
}
```

### Common options:
- watch: watch for file changes and restart
- target: wait for dependent targets before run
- main: entry file to execute

See full options in: [src/executors/run/schema.json]()

## Compatibility
- Nx: >= 20 < 22

