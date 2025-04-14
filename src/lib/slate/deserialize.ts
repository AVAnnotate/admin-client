import { jsx } from 'slate-hyperscript';
import { Text } from 'slate';

let Node;

// JSDOM can't be imported in the browser, and we don't need it there anyway.
// So here we check if we're running in a browser, and if so, we use the
// browser's own Node class. We only import and use JSOM if we're running
// on the backend.
if (typeof window !== 'undefined') {
  Node = window.Node;
} else {
  const { JSDOM } = await import('jsdom');
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
    case 'B':
      nodeAttributes.bold = true;
      break;
    case 'EM':
      nodeAttributes.italic = true;
      break;
    case 'ITALIC':
      nodeAttributes.italic = true;
      break;
    case 'I':
      nodeAttributes.italic = true;
      break;
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
    case 'BLOCKQUOTE':
      return jsx('element', { type: 'quote' }, children);
    case 'BR':
      return jsx('element', { type: 'line-break' }, children);
    case 'P':
      return jsx('element', { type: 'paragraph' }, children);
    case 'SPAN':
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

interface ElementAttributes {
  type: any;
  url?: string;
}

const ELEMENT_TAGS: Record<string, (el: HTMLElement) => ElementAttributes> = {
  A: (el) => ({ type: 'link', url: el.getAttribute('href')! }),
  BLOCKQUOTE: () => ({ type: 'block-quote' }),
  H1: () => ({ type: 'heading-one' }),
  H2: () => ({ type: 'heading-two' }),
  H3: () => ({ type: 'heading-three' }),
  H4: () => ({ type: 'heading-four' }),
  H5: () => ({ type: 'heading-four' }),
  H6: () => ({ type: 'heading-four' }),
  IMG: (el) => ({ type: 'image', url: el.getAttribute('src')! }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'numbered-list' }),
  P: () => ({ type: 'paragraph' }),
  PRE: () => ({ type: 'code-block' }),
  UL: () => ({ type: 'bulleted-list' }),
};

interface TextAttributes {
  code?: boolean;
  strikethrough?: boolean;
  italic?: boolean;
  bold?: boolean;
  underline?: boolean;
}

const TEXT_TAGS: Record<string, () => TextAttributes> = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

export const deserializeHtml = (el: HTMLElement | ChildNode): any => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === 'BR') {
    return '\n';
  }

  const { nodeName } = el;
  let parent = el;

  console.log(nodeName);
  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0];
  }
  let children = Array.from(parent.childNodes).map(deserializeHtml).flat();

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el as HTMLElement);
    return jsx('element', attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = (TEXT_TAGS as any)[nodeName](el);

    return children.map((child) => jsx('text', attrs, child));
  }

  return children;
};
