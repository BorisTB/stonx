# @stonx/elysia — Nx plugin for Elysia

[![npm version](https://img.shields.io/npm/v/@stonx/elysia.svg)](https://www.npmjs.com/package/@stonx/elysia)
[![license: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Nx compatibility](https://img.shields.io/badge/Nx-%E2%89%A518%20%E2%89%A4%2021-blue)](https://nx.dev)
[![CI](https://github.com/BorisTB/stonx/actions/workflows/ci.yml/badge.svg)](https://github.com/BorisTB/stonx/actions)

Nx plugin adding support for [Elysia](https://elysiajs.com/).

## Features

- Generators for scaffolding Elysia applications with Node
- TODO: Generators for scaffolding Elysia applications with Bun


## Add the plugin to an existing Nx workspace

### Recommended:

```shell
nx add @stonx/elysia
```

This command installs the plugin and performs any required setup in your workspace.

### Fallback (manual):
```shell
npm i -D @stonx/elysia
```

Note: Manual installation may require also having compatible peer dependencies installed.


## Generators

This plugin provides the following Nx generators.

### Application

Generate an Elysia application within your Nx workspace.

```shell
nx g @stonx/elysia:app my-app
```


## Build, Serve, and Test

Targets are provided by @nx/node. Typical commands:

- nx serve <appName> — Run the application in development
- nx build <appName> — Build the application with esbuild
- nx test <appName> — Run unit tests (if configured)
- nx lint <appName> — Run linting (if configured)


## Compatibility
- Nx: >= 18 < 22

