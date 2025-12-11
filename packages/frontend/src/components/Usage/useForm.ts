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
      "Panes lets you create custom view modes for HTTP requests and responses using workflows or shell commands.",
      "Use it to pretty-print JSON, decode JWTs, format XML, or run any custom transformation and view it inline in Caido.",
    ],
  },
  {
    id: "quick-start",
    title: "Quick Start",
    body: [
      "1) Open the Panes tab and create a pane with a name, tab label, and input source (request/response).",
      "2) Pick a transformation: select a Convert workflow or provide a shell command using {{input}}.",
      "3) Add an HTTPQL filter if you want to run only on matching requests.",
      "4) Enable the pane and view results in the registered locations.",
    ],
  },
  {
    id: "tips",
    title: "Tips",
    body: [
      "Use HTTPQL filters to avoid running on non-JSON or irrelevant responses.",
      "Prefer workflows for safer transforms; commands are powerful but should be used carefully.",
      "Keep tab names short so they fit nicely in the view mode bar.",
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

