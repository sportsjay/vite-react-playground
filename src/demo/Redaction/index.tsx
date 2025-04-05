import { useMemo, useState } from "react";

import { makeInputStringChangeHandler } from "../utils";
import { INPUT_TEST, REDACT_TEXTAREA } from "./data/constants";
import { useHighlight } from "./hooks/useRedactionHandler";

export const Redaction = () => {
  const [value, setValue] = useState(
    "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus a felis vel nibh ullamcorper eleifend. Sed facilisis augue quam, eu scelerisque purus feugiat vel. Cras quis ante sollicitudin, accumsan ante ac, volutpat elit. Donec in purus tempus, pellentesque <i><u>arcu</u> sit <strike>amet</strike></i>, lobortis justo. Suspendisse vitae felis vitae justo fringilla commodo. Morbi fermentum lacus ac nunc viverra suscipit. Nulla sit amet <b>massa</b> eu neque <i>auctor</i> fermentum. Aenean dapibus tellus nibh, sit amet pretium arcu tempor ac. Phasellus iaculis sem nec urna imperdiet suscipit. Duis dapibus felis congue nibh ultricies euismod. Nulla consequat velit faucibus sem iaculis, pretium tempus urna dignissim. Mauris in neque urna. Nunc ultrices ornare nisi vitae varius. Etiam maximus dictum ante eu pretium. Donec pharetra velit in molestie maximus.</p>"
  );
  const {
    highlightedRanges,
    cancelHighlight,
    clearAll,
    markHighlight,
    selectHighlight,
    shouldMark,
  } = useHighlight();
  const content = useMemo(() => {
    const wrapMarker = (node: Node) => {
      const marker = document.createElement("span");
      marker.style.cssText = "background-color: yellow;";
      marker.appendChild(node);
    };

    // const processedContent = value.split("");
    // highlightedRanges.forEach(({ startIndex, endIndex, node }) => {
    //   processedContent.splice(
    //     startIndex,
    //     0,
    //     "<span style='background-color: orange;'>"
    //   );
    //   processedContent.splice(endIndex + 1, 0, "</span>");
    // });

    return { __html: value };
  }, [highlightedRanges, value]);

  return (
    <div className="container mx-auto px-4 py-4">
      <label htmlFor={INPUT_TEST}></label>
      <textarea
        id={INPUT_TEST}
        value={value}
        className="w-full p-2 border-2 rounded-lg"
        onChange={makeInputStringChangeHandler(setValue)}
      />

      <label className="block font-medium" htmlFor={REDACT_TEXTAREA}>
        Redaction
      </label>
      <div
        id={REDACT_TEXTAREA}
        className="w-full p-2 border-2 rounded-lg mb-4"
        onMouseUp={markHighlight}
        dangerouslySetInnerHTML={content}
      />

      <button
        disabled={!shouldMark}
        onClick={selectHighlight}
        className="rounded cursor-pointer p-2 px-4 disabled:bg-blue-400 bg-blue-700 mr-2"
      >
        Mark
      </button>
      <button
        disabled={!shouldMark}
        onClick={cancelHighlight}
        className="rounded cursor-pointer p-2 px-4 disabled:bg-red-400 bg-red-700 mr-2"
      >
        Cancel
      </button>
      <button
        disabled={!highlightedRanges.length}
        onClick={clearAll}
        className="rounded cursor-pointer p-2 px-4 disabled:bg-orange-400 bg-orange-700"
      >
        Clear
      </button>

      <pre className="mt-4">
        {JSON.stringify(
          highlightedRanges.map(
            ({ startIndex, endIndex, normalizedStartIndex }) => ({
              normalizedStartIndex,
              startIndex,
              endIndex,
            })
          ),
          undefined,
          2
        )}
      </pre>
    </div>
  );
};
