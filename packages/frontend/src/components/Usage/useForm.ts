import { onMounted, onUnmounted, ref } from "vue";

type Section = {
  id: string;
  title: string;
  body: string[];
};

const sections: Section[] = [
  {
    id: "what-is-panes",
    title: "What is Panes?",
    body: [
      "Panes is a powerful Caido plugin that lets you create custom view modes for HTTP requests and responses. These custom tabs appear alongside the built-in Raw, Pretty, and Preview tabs in HTTP History, Replay, Sitemap, Automate, and Intercept.",
      "Use Panes to transform and display data in custom formats - pretty-print JSON, decode Base64, format XML, extract JWT claims, or run any custom transformation using Caido's Convert workflows.",
    ],
  },
  {
    id: "getting-started",
    title: "Getting Started",
    body: [
      "1. Navigate to the Panes Manager tab and click 'New Pane' to create your first pane.",
      "2. Give your pane a Name (internal identifier) and Tab Name (what appears in the UI).",
      "3. Select an Input Source - this determines what data gets transformed (request body, response headers, etc.).",
      "4. Choose your Locations - where the pane tab will appear (HTTP History, Replay, etc.).",
      "5. Select a Convert Workflow from the dropdown - this workflow will transform your input data.",
      "6. Save the pane and reload the page. Your new tab will appear in the selected locations!",
    ],
  },
  {
    id: "input-types",
    title: "Input Types",
    body: [
      "Request Body - The body content of HTTP requests. Great for transforming JSON payloads or form data.",
      "Request Headers - All request headers as JSON. Useful for analyzing authentication tokens or cookies.",
      "Request Query - The URL query string parameters. Perfect for URL decoding or parsing.",
      "Request Raw - The complete raw HTTP request including headers and body.",
      "Response Body - The body content of HTTP responses. Most commonly used for JSON formatting.",
      "Response Headers - All response headers as JSON. Analyze caching directives, content types, etc.",
      "Response Raw - The complete raw HTTP response.",
    ],
  },
  {
    id: "locations",
    title: "Pane Locations",
    body: [
      "HTTP History - The main request/response viewer. Panes appear as tabs when viewing historical requests.",
      "Sitemap - The site structure view. View transformed data while exploring discovered endpoints.",
      "Replay - The request editor. See transformed output while crafting and sending requests.",
      "Automate - The automation tool. View pane output alongside automated request sequences.",
      "Intercept - The proxy intercept view. Transform data in real-time as you intercept traffic.",
    ],
  },
  {
    id: "transformations",
    title: "Transformations",
    body: [
      "Convert Workflows are the recommended way to transform data. Create a workflow in Caido's Workflows section with the 'Convert' type, then select it in your pane.",
      "Example workflows: Base64 Decode, JSON Pretty Print, URL Decode, JWT Decode, XML Format, HTML Entity Decode.",
      "To create a Convert workflow: Go to Workflows > Create > Convert. Add nodes to transform the input and connect them to the output.",
      "Shell Commands are planned for a future release but are not currently supported.",
    ],
  },
  {
    id: "httpql-filtering",
    title: "HTTPQL Filtering",
    body: [
      "Use HTTPQL to filter which requests trigger your pane. If a request doesn't match the filter, the pane won't attempt transformation.",
      "Common filters:",
      'resp.row.cont:"application/json" - Only JSON responses',
      'req.method == "POST" - Only POST requests',
      'req.host.cont:"api" - Only API endpoints',
      "resp.code == 200 - Only successful responses",
      "Leave the HTTPQL field empty to apply the pane to all requests.",
    ],
  },
  {
    id: "export-import",
    title: "Export & Import",
    body: [
      "Export your panes to share configurations with teammates or backup your setup.",
      "Click the Export button in the Panes Manager sidebar to download a JSON file containing your pane configurations.",
      "Import panes from a JSON file using the Import button. You can choose to skip or overwrite existing panes with the same name.",
      "The export includes all pane settings except IDs and timestamps, making it portable across projects.",
    ],
  },
  {
    id: "tips",
    title: "Tips & Best Practices",
    body: [
      "Use descriptive Tab Names - keep them short (under 15 characters) so they fit nicely in the tab bar.",
      "Apply HTTPQL filters - avoid running expensive transformations on irrelevant requests.",
      "Start with Response Body - it's the most common use case and easiest to test with JSON responses.",
      "Test your Convert workflow first - use the Workflows section to verify it works before creating a pane.",
      "One pane per transformation - create separate panes for different transformations rather than combining them.",
      "Disable unused panes - disabled panes don't consume resources. Enable them only when needed.",
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    body: [
      "Pane not appearing? Make sure the pane is enabled and you've reloaded the page after creating it.",
      "Empty output? Check that your HTTPQL filter matches the request, and verify the input type has data.",
      "Workflow errors? Test your Convert workflow independently in the Workflows section with sample input.",
      "Missing workflows in dropdown? Only Convert-type workflows appear. Create a new Convert workflow if needed.",
      "Changes not reflecting? A page reload is required after creating, enabling, or modifying panes.",
    ],
  },
];

export const useForm = () => {
  const activeSection = ref<string>(sections[0]?.id ?? "");
  const contentRef = ref<HTMLElement>();

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      activeSection.value = sectionId;
    }
  };

  const handleScroll = () => {
    if (contentRef.value === undefined) return;
    const scrollPosition = contentRef.value.scrollTop + 200;
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section === undefined) continue;
      const element = document.getElementById(section.id);
      if (element !== null && element.offsetTop <= scrollPosition) {
        activeSection.value = section.id;
        break;
      }
    }
  };

  const isActive = (sectionId: string) => activeSection.value === sectionId;

  onMounted(() => {
    contentRef.value?.addEventListener("scroll", handleScroll);
  });

  onUnmounted(() => {
    contentRef.value?.removeEventListener("scroll", handleScroll);
  });

  return {
    sections,
    activeSection,
    contentRef,
    handleScroll,
    scrollToSection,
    isActive,
  };
};
