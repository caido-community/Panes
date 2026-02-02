<script setup lang="ts"></script>

<template>
  <div class="max-w-3xl space-y-12 pb-[36rem] select-text">
    <section id="what-is-panes">
      <h2 class="text-2xl font-semibold mb-4">What is Panes?</h2>
      <p class="text-surface-300 leading-relaxed mb-4">
        Panes is a powerful Caido plugin that lets you create custom view modes
        for HTTP requests and responses. These custom tabs appear alongside the
        built-in
        <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs">Raw</code>,
        <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs">Pretty</code
        >, and
        <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
          >Preview</code
        >
        tabs in HTTP History, Replay, Sitemap, Automate, and Intercept.
      </p>
      <p class="text-surface-300 leading-relaxed">
        Use Panes to transform and display data in custom formats - pretty-print
        JSON, decode Base64, format XML, extract JWT claims, or run any custom
        transformation using Caido's Convert workflows or shell commands.
      </p>
    </section>

    <section id="getting-started">
      <h2 class="text-2xl font-semibold mb-4">Getting Started</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        Get up and running with Panes in just a few steps:
      </p>

      <div class="space-y-4">
        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">1. Create Your First Pane</h3>
          <p class="text-surface-300 leading-relaxed mb-3">
            Navigate to the <strong>Panes Manager</strong> tab and click
            <strong>New Pane</strong> to create your first pane.
          </p>
          <p class="text-surface-300 text-sm">
            Give your pane a <strong>Name</strong> (internal identifier) and
            <strong>Tab Name</strong> (what appears in the UI). Optionally add a
            <strong>Description</strong> to help you remember what the pane
            does.
          </p>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">
            2. Configure Input and Locations
          </h3>
          <p class="text-surface-300 leading-relaxed mb-3">
            Select an <strong>Input Source</strong> - this determines what data
            gets transformed (request body, response headers, etc.). Choose your
            <strong>Locations</strong> - where the pane tab will appear (HTTP
            History, Replay, etc.).
          </p>
          <p class="text-surface-300 text-sm">
            Most common:
            <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
              >response.body</code
            >
            for JSON formatting in HTTP History.
          </p>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">3. Choose Transformation</h3>
          <p class="text-surface-300 leading-relaxed mb-3">
            Choose a <strong>Transformation Type</strong>:
          </p>
          <div class="space-y-2 mb-3">
            <div class="border-l-4 border-blue-500 pl-3">
              <div class="font-semibold text-sm mb-1">Workflow</div>
              <p class="text-surface-300 text-sm">
                Select a Convert Workflow from the dropdown. Create workflows in
                Caido's <strong>Workflows > Create > Convert</strong> section.
              </p>
            </div>
            <div class="border-l-4 border-blue-500 pl-3">
              <div class="font-semibold text-sm mb-1">Shell Command</div>
              <p class="text-surface-300 text-sm">
                Enter a command like
                <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                  >jq .</code
                >
                or
                <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                  >base64 -d</code
                >. Commands receive input via stdin and output via stdout.
              </p>
            </div>
          </div>
          <p class="text-surface-300 text-sm">
            Optionally enable <strong>Code Block</strong> and select a language
            for syntax highlighting.
          </p>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">4. Save and Use</h3>
          <p class="text-surface-300 leading-relaxed mb-3">
            Optionally add an <strong>HTTPQL filter</strong> to limit when the
            pane runs, then <strong>Save</strong> the pane.
          </p>
          <div class="bg-blue-900/20 border border-blue-800 rounded p-3">
            <p class="text-blue-200 text-sm">
              <i class="fas fa-info-circle mr-2"></i>
              The plugin will automatically reload to apply changes!
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="input-types">
      <h2 class="text-2xl font-semibold mb-4">Input Types</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        Select what data gets transformed by your pane:
      </p>

      <div class="border border-surface-700 rounded p-4">
        <ul class="space-y-3 text-surface-300">
          <li>
            <strong>Request Body</strong> - The body content of HTTP requests.
            Great for transforming JSON payloads or form data.
          </li>
          <li>
            <strong>Request Headers</strong> - All request headers as JSON.
            Useful for analyzing authentication tokens or cookies.
          </li>
          <li>
            <strong>Request Query</strong> - The URL query string parameters.
            Perfect for URL decoding or parsing.
          </li>
          <li>
            <strong>Request Raw</strong> - The complete raw HTTP request
            including headers and body.
          </li>
          <li>
            <strong>Response Body</strong> - The body content of HTTP responses.
            Most commonly used for JSON formatting.
          </li>
          <li>
            <strong>Response Headers</strong> - All response headers as JSON.
            Analyze caching directives, content types, etc.
          </li>
          <li>
            <strong>Response Raw</strong> - The complete raw HTTP response.
          </li>
        </ul>
      </div>
    </section>

    <section id="locations">
      <h2 class="text-2xl font-semibold mb-4">Pane Locations</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        Choose where your pane tabs will appear:
      </p>

      <div class="border border-surface-700 rounded p-4">
        <ul class="space-y-3 text-surface-300">
          <li>
            <strong>HTTP History</strong> - The main request/response viewer.
            Panes appear as tabs when viewing historical requests.
          </li>
          <li>
            <strong>Sitemap</strong> - The site structure view. View transformed
            data while exploring discovered endpoints.
          </li>
          <li>
            <strong>Replay</strong> - The request editor. See transformed output
            while crafting and sending requests.
          </li>
          <li>
            <strong>Automate</strong> - The automation tool. View pane output
            alongside automated request sequences.
          </li>
          <li>
            <strong>Intercept</strong> - The proxy intercept view. Transform
            data in real-time as you intercept traffic.
          </li>
        </ul>
      </div>
    </section>

    <section id="transformations">
      <h2 class="text-2xl font-semibold mb-4">Transformations</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        Panes supports two types of transformations:
      </p>

      <div class="space-y-6">
        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3 text-green-400">
            Convert Workflows
          </h3>
          <p class="text-surface-300 leading-relaxed mb-3">
            The recommended way to transform data. Create a workflow in Caido's
            <strong>Workflows</strong> section with the
            <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
              >Convert</code
            >
            type, then select it in your pane.
          </p>
          <p class="text-surface-300 text-sm mb-3">
            Example workflows: Base64 Decode, JSON Pretty Print, URL Decode, JWT
            Decode, XML Format, HTML Entity Decode.
          </p>
          <p class="text-surface-300 text-sm">
            To create a Convert workflow: Go to
            <strong>Workflows > Create > Convert</strong>. Add nodes to
            transform the input and connect them to the output.
          </p>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3 text-blue-400">
            Shell Commands
          </h3>
          <p class="text-surface-300 leading-relaxed mb-3">
            Execute external commands like
            <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs">jq</code
            >,
            <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
              >base64</code
            >,
            <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
              >grep</code
            >, etc. Commands receive the input data via stdin and output via
            stdout.
          </p>
          <p class="text-surface-300 text-sm font-semibold mb-2">
            Example commands:
          </p>
          <div class="space-y-2 mb-3">
            <div class="bg-surface-900 rounded p-3 font-mono text-xs">
              <div class="text-surface-400">jq .</div>
              <div class="text-surface-300 text-xs mt-1">Pretty print JSON</div>
            </div>
            <div class="bg-surface-900 rounded p-3 font-mono text-xs">
              <div class="text-surface-400">jq '.key'</div>
              <div class="text-surface-300 text-xs mt-1">
                Extract a specific JSON key
              </div>
            </div>
            <div class="bg-surface-900 rounded p-3 font-mono text-xs">
              <div class="text-surface-400">base64 -d</div>
              <div class="text-surface-300 text-xs mt-1">Decode base64</div>
            </div>
          </div>
          <div class="mt-3 border-l-4 border-green-500 pl-3">
            <div class="font-semibold text-sm mb-2">Shell Configuration</div>
            <p class="text-surface-300 text-sm mb-2">
              Customize the shell used to execute commands:
            </p>
            <ul class="text-surface-300 text-sm space-y-1">
              <li>
                <strong>Shell Path</strong> - The shell executable (default:
                <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                  >/bin/bash</code
                >)
              </li>
              <li>
                <strong>Shell Config</strong> - Config file to source (default:
                <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                  >~/.bashrc</code
                >)
              </li>
            </ul>
            <p class="text-surface-300 text-xs mt-2">
              Cross-platform: Use
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >/bin/zsh</code
              >
              with
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >~/.zshrc</code
              >
              on macOS, or
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >powershell.exe</code
              >
              on Windows.
            </p>
          </div>
          <p class="text-surface-300 text-sm mt-3">
            Commands support variable expansion (see
            <strong>Command Variables</strong>
            section). Set a timeout (default 30 seconds) to prevent commands
            from hanging.
          </p>
        </div>
      </div>
    </section>

    <section id="command-variables">
      <h2 class="text-2xl font-semibold mb-4">Command Variables</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        When using <strong>Shell Commands</strong>, you can use variables that
        get expanded before execution:
      </p>

      <div class="space-y-4">
        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Input Variables</h3>
          <div class="bg-surface-900 rounded p-3 font-mono text-xs mb-2">
            <div class="text-surface-400">
              <span class="text-primary-400"
                >&#123;&#123;input&#125;&#125;</span
              >
              or
              <span class="text-primary-400"
                >&#123;&#123; input &#125;&#125;</span
              >
            </div>
            <div class="text-surface-300 text-xs mt-1">
              The extracted input data
            </div>
          </div>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Request Variables</h3>
          <div class="space-y-2">
            <div class="bg-surface-900 rounded p-3 font-mono text-xs">
              <div class="text-surface-400">
                <span class="text-primary-400"
                  >&#123;&#123;requestId&#125;&#125;</span
                >,
                <span class="text-primary-400"
                  >&#123;&#123;host&#125;&#125;</span
                >,
                <span class="text-primary-400"
                  >&#123;&#123;port&#125;&#125;</span
                >,
                <span class="text-primary-400"
                  >&#123;&#123;path&#125;&#125;</span
                >,
                <span class="text-primary-400"
                  >&#123;&#123;method&#125;&#125;</span
                >,
                <span class="text-primary-400">&#123;&#123;url&#125;&#125;</span
                >,
                <span class="text-primary-400"
                  >&#123;&#123;scheme&#125;&#125;</span
                >,
                <span class="text-primary-400"
                  >&#123;&#123;query&#125;&#125;</span
                >
              </div>
              <div class="text-surface-300 text-xs mt-1">
                Request ID, hostname, port, path, HTTP method, full URL, scheme
                (http/https), query string
              </div>
            </div>
          </div>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">
            Response Variables (only available for response inputs)
          </h3>
          <div class="bg-surface-900 rounded p-3 font-mono text-xs">
            <div class="text-surface-400">
              <span class="text-primary-400"
                >&#123;&#123;responseCode&#125;&#125;</span
              >,
              <span class="text-primary-400"
                >&#123;&#123;responseLength&#125;&#125;</span
              >
            </div>
            <div class="text-surface-300 text-xs mt-1">
              Response status code, response body length
            </div>
          </div>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Example</h3>
          <p class="text-surface-300 text-sm mb-2">Command:</p>
          <div class="bg-surface-900 rounded p-3 font-mono text-xs mb-3">
            echo 'Processing &#123;&#123;method&#125;&#125; request to
            &#123;&#123;host&#125;&#125;&#123;&#123;path&#125;&#125;'
          </div>
          <p class="text-surface-300 text-sm mb-2">Expanded:</p>
          <div class="bg-surface-900 rounded p-3 font-mono text-xs">
            echo 'Processing POST request to example.com/api/users'
          </div>
          <p class="text-surface-300 text-sm mt-3">
            All variable values are automatically escaped for shell safety.
          </p>
        </div>
      </div>
    </section>

    <section id="httpql-filtering">
      <h2 class="text-2xl font-semibold mb-4">HTTPQL Filtering</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        Use <strong>HTTPQL</strong> to filter which requests trigger your pane.
        If a request doesn't match the filter, the pane won't attempt
        transformation.
      </p>

      <div class="border border-surface-700 rounded p-4">
        <h3 class="text-lg font-semibold mb-3">Common Filters</h3>
        <div class="space-y-2">
          <div class="bg-surface-900 rounded p-3 font-mono text-xs">
            <div class="text-surface-400">resp.raw.cont:"application/json"</div>
            <div class="text-surface-300 text-xs mt-1">Only JSON responses</div>
          </div>
          <div class="bg-surface-900 rounded p-3 font-mono text-xs">
            <div class="text-surface-400">req.method.eq:"POST"</div>
            <div class="text-surface-300 text-xs mt-1">Only POST requests</div>
          </div>
          <div class="bg-surface-900 rounded p-3 font-mono text-xs">
            <div class="text-surface-400">req.host.cont:"api"</div>
            <div class="text-surface-300 text-xs mt-1">Only API endpoints</div>
          </div>
          <div class="bg-surface-900 rounded p-3 font-mono text-xs">
            <div class="text-surface-400">resp.code.eq:200</div>
            <div class="text-surface-300 text-xs mt-1">
              Only successful responses
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-surface-800 border border-surface-700 rounded p-4">
        <p class="text-surface-300 text-sm">
          <i class="fas fa-info-circle text-blue-400 mr-2"></i>
          Leave the <strong>HTTPQL</strong> field empty to apply the pane to all
          requests.
        </p>
      </div>
    </section>

    <section id="code-block">
      <h2 class="text-2xl font-semibold mb-4">
        Code Block & Syntax Highlighting
      </h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        Enable syntax highlighting for your pane output using
        <strong>CodeMirror</strong> integration.
      </p>

      <div class="space-y-4">
        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">How to use</h3>
          <ol class="list-decimal list-inside space-y-2 text-surface-300 ml-4">
            <li>
              When creating or editing a pane, check the
              <strong>Code Block</strong> option.
            </li>
            <li>
              Select a language from the dropdown (
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >JSON</code
              >,
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >JavaScript</code
              >,
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >HTML</code
              >,
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >XML</code
              >, etc.).
            </li>
            <li>
              The output will be displayed with syntax highlighting matching the
              selected language.
            </li>
          </ol>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">When to use</h3>
          <div class="space-y-2">
            <div class="border-l-4 border-blue-500 pl-3">
              <div class="font-semibold text-sm mb-1">JSON responses</div>
              <p class="text-surface-300 text-sm">
                Select
                <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                  >JSON</code
                >
                for pretty formatting
              </p>
            </div>
            <div class="border-l-4 border-blue-500 pl-3">
              <div class="font-semibold text-sm mb-1">HTML content</div>
              <p class="text-surface-300 text-sm">
                Select
                <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                  >HTML</code
                >
                for syntax highlighting
              </p>
            </div>
            <div class="border-l-4 border-blue-500 pl-3">
              <div class="font-semibold text-sm mb-1">JavaScript code</div>
              <p class="text-surface-300 text-sm">
                Select
                <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                  >JavaScript</code
                >
                or
                <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                  >TypeScript</code
                >
              </p>
            </div>
            <div class="border-l-4 border-blue-500 pl-3">
              <div class="font-semibold text-sm mb-1">Configuration files</div>
              <p class="text-surface-300 text-sm">
                Select
                <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                  >YAML</code
                >
                or
                <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                  >JSON</code
                >
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-surface-800 border border-surface-700 rounded p-4">
        <p class="text-surface-300 text-sm">
          <i class="fas fa-info-circle text-blue-400 mr-2"></i>
          If <strong>Code Block</strong> is disabled, output is displayed as
          plain text with word wrapping.
        </p>
      </div>
    </section>

    <section id="export-import">
      <h2 class="text-2xl font-semibold mb-4">Export & Import</h2>
      <p class="text-surface-300 leading-relaxed mb-6">
        Export your panes to share configurations with teammates or backup your
        setup.
      </p>

      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-3">Export</h3>
          <ol class="list-decimal list-inside space-y-2 text-surface-300 ml-4">
            <li>
              Click the <strong>Export</strong> button in the
              <strong>Panes Manager</strong> sidebar
            </li>
            <li>
              Select specific panes to export, or leave all selected to export
              everything
            </li>
            <li>
              Download a
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >JSON</code
              >
              file containing all pane configurations
            </li>
          </ol>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Import</h3>
          <ol class="list-decimal list-inside space-y-2 text-surface-300 ml-4">
            <li>
              Click the <strong>Import</strong> button in the
              <strong>Panes Manager</strong> sidebar
            </li>
            <li>
              Select a
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >JSON</code
              >
              file exported from Panes
            </li>
            <li>
              Choose to skip or overwrite existing panes with the same name
            </li>
            <li>Review the import results (created, skipped, errors)</li>
          </ol>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">What's included</h3>
          <ul class="list-disc list-inside space-y-2 text-surface-300 ml-4">
            <li>
              All pane settings (name, input, locations, transformation, etc.)
            </li>
            <li><strong>Code Block</strong> and language settings</li>
            <li><strong>HTTPQL</strong> filters</li>
            <li>
              Export does <strong>NOT</strong> include IDs and timestamps,
              making it portable across projects
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section id="tips">
      <h2 class="text-2xl font-semibold mb-4">Tips & Best Practices</h2>

      <div class="border border-surface-700 rounded p-4">
        <ul class="space-y-3 text-surface-300">
          <li>
            Apply <strong>HTTPQL filters</strong> to avoid running expensive
            transformations on irrelevant requests.
          </li>
          <li>
            Start with <strong>Response Body</strong> - it's the most common use
            case and easiest to test with JSON responses.
          </li>
          <li>
            Test your Convert workflow first in the
            <strong>Workflows</strong> section before creating a pane.
          </li>
          <li>
            Enable <strong>Code Block</strong> for structured data (JSON, XML,
            HTML) - syntax highlighting makes it easier to read.
          </li>
          <li>
            Set appropriate command timeouts to prevent commands from hanging
            indefinitely.
          </li>
        </ul>
      </div>
    </section>

    <section id="troubleshooting">
      <h2 class="text-2xl font-semibold mb-4">Troubleshooting</h2>

      <div class="space-y-6">
        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Pane not appearing</h3>
          <ul class="list-disc list-inside space-y-2 text-surface-300 ml-4">
            <li>
              Make sure the pane is enabled (toggle switch in Dashboard or Panes
              Manager)
            </li>
            <li>
              Verify the pane is configured for the location you're viewing
            </li>
            <li>
              Check that the input type matches the request/response you're
              viewing
            </li>
            <li>
              The plugin auto-reloads after changes, but manual reload may be
              needed in some cases
            </li>
          </ul>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Empty output</h3>
          <ul class="list-disc list-inside space-y-2 text-surface-300 ml-4">
            <li>
              Check that your <strong>HTTPQL filter</strong> matches the request
            </li>
            <li>
              Verify the input type has data (e.g.,
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >response.body</code
              >
              exists)
            </li>
            <li>
              For command transformations, check that the command is installed
              and accessible
            </li>
            <li>
              Review error messages in the view mode - they provide specific
              failure reasons
            </li>
          </ul>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Workflow errors</h3>
          <ul class="list-disc list-inside space-y-2 text-surface-300 ml-4">
            <li>
              Test your Convert workflow independently in the
              <strong>Workflows</strong>
              section with sample input
            </li>
            <li>Ensure the workflow is enabled in Caido's Workflows section</li>
            <li>
              Verify the workflow accepts the input format you're providing
            </li>
          </ul>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Command errors</h3>
          <ul class="list-disc list-inside space-y-2 text-surface-300 ml-4">
            <li>Verify the command is installed and available in your PATH</li>
            <li>
              Check command syntax - use variables correctly (
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >&#123;&#123;variable&#125;&#125;</code
              >
              or
              <code class="px-1.5 py-0.5 bg-surface-800 rounded text-xs"
                >&#123;&#123; variable &#125;&#125;</code
              >)
            </li>
            <li>Review timeout settings - commands may be timing out</li>
            <li>Test the command manually in a terminal with sample input</li>
          </ul>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">
            Missing workflows in dropdown
          </h3>
          <ul class="list-disc list-inside space-y-2 text-surface-300 ml-4">
            <li>
              Only <strong>Convert-type</strong> workflows appear in the
              dropdown
            </li>
            <li>
              Create a new Convert workflow if needed:
              <strong>Workflows > Create > Convert</strong>
            </li>
            <li>Refresh the Panes Manager page to reload the workflow list</li>
          </ul>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Syntax highlighting issues</h3>
          <ul class="list-disc list-inside space-y-2 text-surface-300 ml-4">
            <li>
              Ensure <strong>Code Block</strong> is enabled and a language is
              selected
            </li>
            <li>Try a different language if highlighting seems incorrect</li>
            <li>
              Plain text mode works for any content if highlighting isn't needed
            </li>
          </ul>
        </div>

        <div class="border border-surface-700 rounded p-4">
          <h3 class="text-lg font-semibold mb-3">Changes not reflecting</h3>
          <ul class="list-disc list-inside space-y-2 text-surface-300 ml-4">
            <li>
              The plugin automatically reloads after creating, enabling, or
              modifying panes
            </li>
            <li>If changes don't appear, try a manual page reload</li>
            <li>
              Check that you saved the pane (click <strong>Save</strong> button)
            </li>
            <li>Verify the pane is enabled if you're expecting to see it</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
