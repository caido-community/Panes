<div align="center">
  <img width="1000" alt="image" src="https://github.com/caido-community/.github/blob/main/content/banner.png?raw=true">

  <br />
  <br />
  <a href="https://github.com/caido-community" target="_blank">Github</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://developer.caido.io/" target="_blank">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://links.caido.io/www-discord" target="_blank">Discord</a>
  <br />
  <hr />
</div>

# Panes

Custom view modes for HTTP requests and responses in Caido.

### About Panes

Panes is a powerful plugin that lets you create custom view modes for HTTP requests and responses. These custom tabs appear alongside the built-in Raw, Pretty, and Preview tabs in HTTP History, Replay, Sitemap, Automate, and Intercept.

Transform and display data in custom formats - pretty-print JSON, decode Base64, format XML, extract JWT claims, or run any custom transformation using Caido's Convert workflows or shell commands.

## 🚀 Getting Started

### Installation [Recommended]

1. Open Caido, navigate to the `Plugins` sidebar page and then to the `Community Store` tab
2. Find `Panes` and click Install
3. Done! 🎉

### Installation [Manual]

1. Go to the [Panes Releases tab](https://github.com/caido-community/panes/releases) and download the latest `plugin_package.zip` file
2. In your Caido instance, navigate to the `Plugins` page, click `Install` and select the downloaded `plugin_package.zip` file
3. Done! 🎉

## 💚 Community

Join our [Discord](https://links.caido.io/www-discord) community and connect with other Caido users! Share your ideas, ask questions, and get involved in discussions around Caido and security testing.

## 🧑‍💻 Developer Documentation

### Panes Structure

The project is organized into distinct packages: `backend`, `frontend`, and `shared`. The `backend` package handles all pane management, transformations, and workflow execution. The `frontend` package provides the UI for managing panes and displaying transformed content.

### Pane Definition

A pane consists of:

- **Input Source**: What data to transform (request body, response headers, etc.)
- **Locations**: Where the pane tab appears (HTTP History, Replay, Sitemap, etc.)
- **Transformation**: Either a Convert Workflow or a Shell Command
- **HTTPQL Filter**: Optional filter to limit when the pane runs
- **Code Block**: Optional syntax highlighting for the output

### Adding a New Pane Template

Panes includes a template system that allows you to create ready-to-use pane configurations. Templates are automatically installed when users first use the plugin.

#### 1) Create Template File

Create a new template file in `packages/shared/src/templates/`:

```ts
import type { CreatePaneInput } from "../types";

export const myTemplate: CreatePaneInput = {
  name: "My Template",
  tabName: "MyTab",
  description: "Description of what this template does",
  enabled: false,
  scope: "global",
  input: "response.body",
  locations: ["http-history", "replay"],
  transformation: {
    type: "command",
    command: "my-command",
    timeout: 30,
    shell: "/bin/bash",
    shellConfig: "~/.bashrc",
  },
  codeBlock: true,
  language: "json",
};
```

#### 2) Register Template

Open `packages/shared/src/templates/index.ts` and add your template:

```ts
import { myTemplate } from "./my-template";

export const PANE_TEMPLATES: PaneTemplate[] = [
  { ...jqTemplate, templateId: "jq" },
  { ...myTemplate, templateId: "my-template" },
];
```

#### 3) Validate Locally

Run formatting, types, and tests from the repo root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## 🤝 Contributing

Feel free to contribute! If you'd like to request a feature or report a bug, please create a [GitHub Issue](https://github.com/caido-community/panes/issues/new).

### Ways to Contribute

- Report bugs and request features via GitHub Issues
- Improve documentation and examples
- Add new pane templates
- Enhance existing functionality
