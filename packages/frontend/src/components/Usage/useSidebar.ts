import { ref } from "vue";

type Section = {
  id: string;
  title: string;
};

const sections: Section[] = [
  { id: "what-is-panes", title: "What is Panes?" },
  { id: "quick-start", title: "Quick Start" },
  { id: "tips", title: "Tips" },
];

export const useSidebar = () => {
  const activeSection = ref<string>(sections[0]?.id ?? "");

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      activeSection.value = sectionId;
    }
  };

  return {
    sections,
    activeSection,
    scrollToSection,
  };
};

