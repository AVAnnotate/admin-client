import { jsx } from 'slate-hyperscript';

let Node;

// JSDOM can't be imported in the browser, and we don't need it there anyway.
// So here we check if we're running in a browser, and if so, we use the
// browser's own Node class. We only import and use JSOM if we're running
// on the backend.
if (window) {
  Node = window.Node;
} else {
  const { JSDOM } = await import('jsdom')
  Node = new JSDOM('').window.Node;
}


export const deserialize = (
  el: DocumentFragment | ChildNode,
  markAttributes: { [key: string]: boolean } = {}
): any => {
  if (el.nodeType === Node.TEXT_NODE) {
    return jsx('text', markAttributes, el.textContent);
  } else if (
    el.nodeType !== Node.DOCUMENT_FRAGMENT_NODE &&
    el.nodeType !== Node.ELEMENT_NODE
  ) {
    console.log('Node type !==  Node.DOCUMENT_FRAGMENT_NODE', el.nodeType);
    return null;
  }

  const nodeAttributes = { ...markAttributes };

  // define attributes for text nodes
  switch (el.nodeName) {
    case 'STRONG':
      nodeAttributes.bold = true;
  }

  const children = Array.from(el.childNodes)
    .map((node) => deserialize(node, nodeAttributes))
    .flat();

  if (children.length === 0) {
    children.push(jsx('text', nodeAttributes, ''));
  }

  switch (el.nodeName) {
    case 'BODY':
      return jsx('fragment', {}, children);
    case 'BR':
      return '\n';
    case 'BLOCKQUOTE':
      return jsx('element', { type: 'quote' }, children);
    case 'P':
      return jsx('element', { type: 'paragraph' }, children);
    case 'A':
      return jsx(
        'element',
        { type: 'link', url: (el as Element).getAttribute('href') },
        children
      );
    default:
      return children;
  }
};
