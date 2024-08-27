import {
  EmbeddedEvent,
  EmbeddedEventComparison,
} from '@components/EmbeddedEvent/index.ts';
import { Node, Text, type Descendant } from 'slate';

export const Element = ({
  attributes,
  children,
  element,
  project,
  i18n,
}: any) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    case 'image':
      return (
        <div {...attributes} style={style} contentEditable={false}>
          <img src={element.url} className={`slate-img-${element.size}`} />
          {children}
        </div>
      );
    case 'grid':
      return (
        <div
          className='slate-grid'
          style={{
            display: 'grid',
            gridTemplateColumns: `${element.layout[0]}fr ${element.layout[1]}fr`,
          }}
          {...attributes}
        >
          {children}
        </div>
      );
    case 'column':
      return (
        <div className='slate-column' {...attributes}>
          {children}
        </div>
      );
    case 'event':
      return (
        <div {...attributes} contentEditable={false}>
          <EmbeddedEvent element={element} project={project} i18n={i18n} />
          {children}
        </div>
      );
    case 'event-comparison':
      return (
        <div {...attributes} contentEditable={false}>
          <EmbeddedEventComparison
            element={element}
            project={project}
            i18n={i18n}
          />
          {children}
        </div>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

export const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <s>{children}</s>;
  }

  if (leaf.highlight) {
    children = (
      <span style={{ backgroundColor: leaf.highlight }}>{children}</span>
    );
  }

  if (leaf.color) {
    children = <span style={{ color: leaf.color }}>{children}</span>;
  }

  if (leaf.link) {
    children = (
      <a href={leaf.link} target='_blank' rel='noopener noreferrer'>
        {children}
      </a>
    );
  }

  return <span {...attributes}>{children}</span>;
};

export const serialize = (nodes: Node[]) => {
  return nodes.map((node, idx) => {
    if (Text.isText(node)) {
      return node.text;
    }

    if (node.children) {
      const children = node.children.map((node) => serialize([node])).join('');
      return (
        <Element element={node} key={idx}>
          {children}
        </Element>
      );
    } else {
      return <Element element={node} key={idx} />;
    }
  });
};

export const emptyParagraph: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];
