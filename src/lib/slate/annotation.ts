import { Text, type Node } from 'slate';

export const normalizeAnnotation = (nodes: Node[]): Node[] => {
  const result: Node[] = [];
  let textNodes: Text[] = [];

  const flushText = () => {
    if (textNodes.length > 0) {
      result.push({ type: 'paragraph', children: textNodes });
      textNodes = [];
    }
  };

  for (const node of nodes) {
    if (Text.isText(node)) {
      textNodes.push(node);
    } else {
      flushText();
      result.push(node);
    }
  }
  flushText();

  return result.length > 0
    ? result
    : [{ type: 'paragraph', children: [{ text: '' }] }];
};
