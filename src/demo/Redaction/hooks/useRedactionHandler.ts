import { useCallback, useState } from "react";
import { REDACT_TEXTAREA } from "../data/constants";

// Add metadata on "true" offset -> innerHTML offset
type HighlightedRange = {
  normalizedStartIndex: number;
  startIndex: number;
  endIndex: number;
  node: Node;
};

const isNodeWithinParentWithId = (node: HTMLElement | null, id: string) => {
  if (!node) return;
  if (node.id === id) return node;
  return isNodeWithinParentWithId(node.parentElement, id);
};

const countElementTagLength = (node: HTMLElement): [number, number] => {
  const pattern = /<([a-zA-Z]+)([^>]*?)>(.*?)<\/\1>/g;
  const patternIterator = node.outerHTML.matchAll(pattern);
  const [, tagName, attributes] = [...patternIterator][0];

  const openTagLength = `<${tagName}${!!attributes ? ` ${attributes}` : ""}>`
    .length;
  const closeTagLength = `</${tagName}>`.length;

  return [openTagLength, closeTagLength];
};

class HTMLTreeStack {
  public stack: HTMLElement[] = [];
  public offset = 0;

  public pop = () => {
    const component = this.stack.pop();
    if (component?.parentElement) {
      this.offset += countElementTagLength(component.parentElement)[1];
    }

    return component;
  };

  public add = (component: Node): void => {
    if (!component.parentElement) return;
    if (component.parentElement.id === REDACT_TEXTAREA) return;
    if (this.has(component.parentElement)) return;

    this.stack.push(component.parentElement);
    this.offset += countElementTagLength(component.parentElement)[0];
    return this.add(component.parentElement);
  };

  public has = (component: Node) => {
    return !!this.stack.find((node) => node === component);
  };

  constructor() {}

  public static create = () => new HTMLTreeStack();
}

const calculateNodeOffsets = (
  start: Node,
  end: Node,
  parent: Node,
  startOffset: number,
  endOffset: number
): HighlightedRange[] => {
  let hasStarted = false;
  let traversedTextLength = 0;
  const htmlTreeStack = HTMLTreeStack.create();
  const ranges: HighlightedRange[] = [];
  const iterator = document.createNodeIterator(parent, NodeFilter.SHOW_TEXT);

  while (iterator.nextNode()) {
    const currentNode = iterator.referenceNode;
    traversedTextLength += currentNode.textContent?.length ?? 0;

    if (!htmlTreeStack.has(currentNode)) {
      htmlTreeStack.add(currentNode);
    }

    if (currentNode === start && currentNode === end) {
      return [
        {
          startIndex: startOffset,
          normalizedStartIndex: htmlTreeStack.offset,
          endIndex: endOffset,
          node: currentNode,
        },
      ];
    }

    if (currentNode !== start && currentNode !== end) {
      if (hasStarted) {
        ranges.push({
          startIndex: 0,
          normalizedStartIndex: htmlTreeStack.offset + traversedTextLength,
          endIndex: traversedTextLength,
          node: currentNode,
        });
      }

      if (!currentNode.nextSibling) {
        htmlTreeStack.pop();
      }
    }

    if (currentNode === start) {
      hasStarted = true;
      ranges.push({
        startIndex: startOffset,
        normalizedStartIndex: htmlTreeStack.offset + traversedTextLength,
        endIndex: traversedTextLength,
        node: currentNode,
      });

      if (!currentNode.nextSibling) {
        htmlTreeStack.pop();
      }
    }

    if (currentNode === end) {
      ranges.push({
        startIndex: 0,
        normalizedStartIndex: htmlTreeStack.offset,
        endIndex: endOffset,
        node: currentNode,
      });

      return ranges;
    }
  }

  return ranges;
};

export const useHighlight = () => {
  const [shouldMark, setShouldMark] = useState(false);
  const [currentRange, setCurrentRange] = useState<HighlightedRange[]>([]);
  const [highlightedRanges, setHighlightedRanges] = useState<
    HighlightedRange[]
  >([]);

  const cancelHighlight = useCallback(() => {
    setShouldMark(false);
    setCurrentRange([]);
  }, [setShouldMark, setCurrentRange]);

  const clearAll = useCallback(() => {
    cancelHighlight();
    setHighlightedRanges([]);
  }, [cancelHighlight, setHighlightedRanges]);

  const markHighlight = useCallback(() => {
    const component = window.getSelection();
    if (!component || component.rangeCount === 0) {
      return cancelHighlight();
    }

    const selectedContent = component.getRangeAt(0);
    const {
      startOffset,
      endOffset,
      startContainer,
      endContainer,
      commonAncestorContainer,
    } = selectedContent;
    const parent = isNodeWithinParentWithId(
      commonAncestorContainer.parentElement,
      REDACT_TEXTAREA
    );

    if (!parent) {
      return cancelHighlight();
    }

    const result = calculateNodeOffsets(
      startContainer,
      endContainer,
      parent,
      startOffset,
      endOffset
    );

    setCurrentRange(result);
    setShouldMark(true);
  }, [setCurrentRange, setShouldMark]);

  const selectHighlight = useCallback(() => {
    if (!shouldMark) return;

    setShouldMark(false);
    setHighlightedRanges((ranges) => [...ranges, ...currentRange]);
  }, [
    currentRange,
    shouldMark,
    cancelHighlight,
    setShouldMark,
    setHighlightedRanges,
  ]);

  return {
    highlightedRanges,
    cancelHighlight,
    clearAll,
    markHighlight,
    selectHighlight,
    shouldMark,
  };
};
