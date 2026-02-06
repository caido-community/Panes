import type { SearchQuery } from "@codemirror/search";
import type { EditorView } from "@codemirror/view";
import type { InjectionKey, Ref } from "vue";

export const SearchPanelSymbol: InjectionKey<SearchPanelContext> =
  Symbol("SearchPanel");

export type SearchPanelContext = {
  view: EditorView;
  query: Ref<SearchQuery>;
};
