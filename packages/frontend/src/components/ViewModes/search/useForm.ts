import {
  closeSearchPanel,
  findNext,
  findPrevious,
  SearchQuery,
  setSearchQuery,
} from "@codemirror/search";
import type { EditorView } from "@codemirror/view";
import type { Ref } from "vue";
import { computed, ref, watchEffect } from "vue";

export const useForm = (view: EditorView, query: Ref<SearchQuery>) => {
  const search = ref(query.value.search);
  const asRegex = ref(query.value.regexp);
  const matchCase = ref(query.value.caseSensitive);
  const byWord = ref(query.value.wholeWord);

  watchEffect(() => {
    search.value = query.value.search;
    asRegex.value = query.value.regexp;
    matchCase.value = query.value.caseSensitive;
    byWord.value = query.value.wholeWord;
  });

  const count = computed(() => {
    if (query.value.search === "") return 0;

    try {
      const iterator = query.value.getCursor(view.state);

      let matches = 0;
      for (;;) {
        const { done } = iterator.next();
        if (done === true) break;
        matches++;
      }

      return matches;
    } catch {
      return 0;
    }
  });

  const onUpdateSearch = (value: string) => {
    search.value = value;
    dispatch();
  };

  const onToggleRegex = () => {
    asRegex.value = !asRegex.value;
    dispatch();
  };

  const onToggleMatchCase = () => {
    matchCase.value = !matchCase.value;
    dispatch();
  };

  const onToggleByWord = () => {
    byWord.value = !byWord.value;
    dispatch();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.shiftKey && event.key === "Enter") {
      findPrevious(view);
    } else if (event.key === "Enter") {
      findNext(view);
    }
  };

  const onNextClick = () => findNext(view);
  const onPrevClick = () => findPrevious(view);
  const onCloseClick = () => closeSearchPanel(view);

  const dispatch = () => {
    const newQuery = new SearchQuery({
      search: search.value,
      regexp: asRegex.value,
      caseSensitive: matchCase.value,
      wholeWord: byWord.value,
    });

    if (!query.value.eq(newQuery)) {
      view.dispatch({
        effects: setSearchQuery.of(newQuery),
      });
    }
  };

  return {
    search,
    asRegex,
    matchCase,
    byWord,
    count,
    onUpdateSearch,
    onToggleRegex,
    onToggleMatchCase,
    onToggleByWord,
    onKeyDown,
    onNextClick,
    onPrevClick,
    onCloseClick,
  };
};
