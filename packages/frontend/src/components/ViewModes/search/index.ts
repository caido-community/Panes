import { Classic } from "@caido/primevue";
import type { SearchQuery } from "@codemirror/search";
import { getSearchQuery, search, setSearchQuery } from "@codemirror/search";
import type { EditorView, ViewUpdate } from "@codemirror/view";
import Primevue from "primevue/config";
import type { Ref } from "vue";
import { createApp, ref } from "vue";

import { SearchPanelSymbol } from "./constants";
import PanelComponent from "./Panel.vue";

interface Panel {
  dom: HTMLElement;
  mount?: () => void;
  update?: (update: ViewUpdate) => void;
  destroy?: () => void;
}

class SearchPanel implements Panel {
  dom = document.createElement("div");

  query: Ref<SearchQuery>;
  view: EditorView;

  constructor(view: EditorView) {
    this.query = ref(getSearchQuery(view.state));
    this.view = view;

    const app = createApp(PanelComponent);
    app.use(Primevue, {
      pt: Classic,
      unstyled: true,
    });

    app.provide(SearchPanelSymbol, {
      query: this.query,
      view,
    });

    app.mount(this.dom);
  }

  mount() {
    const input = this.dom.querySelector("input[data-main-field='true']");
    if (input instanceof HTMLInputElement) {
      input.setAttribute("main-field", "true");

      if (this.view.hasFocus) {
        input.focus();
      }
    }
  }

  update(update: ViewUpdate) {
    for (const tr of update.transactions)
      for (const effect of tr.effects) {
        if (effect.is(setSearchQuery) && !effect.value.eq(this.query.value)) {
          this.query.value = effect.value;
        }
      }
  }
}

const searchPanel = search({
  createPanel: (view) => {
    return new SearchPanel(view);
  },
});

export const SearchExt = {
  create: () => {
    return [searchPanel];
  },
};
