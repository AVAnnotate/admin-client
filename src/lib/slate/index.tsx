import {
  EmbeddedEvent,
  EmbeddedEventComparison,
} from '@components/EmbeddedEvent/index.ts';
import { RTEColumn } from '@components/RTEColumn/RTEColumn.tsx';
import { RTEImage } from '@components/RTEImage/RTEImage.tsx';
import { getTranslationsFromUrl } from '@i18n';
import { progressPropDefs } from '@radix-ui/themes/dist/esm/components/progress.props.js';
import { type Element as SlateElement, Node, Text } from 'slate';

export const Element = ({
  attributes,
  children,
  element,
  project,
  i18n,
  onChange,
}: any) => {
  const style = { textAlign: element.align };

  const { t } = i18n;

  switch (element.type) {
    case 'link':
      return <a href={element.url}>{children}</a>;
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
    case 'line-break':
      return <br contentEditable={false} />;
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
          <RTEImage
            url={element.url}
            i18n={i18n}
            altName=''
            scale={element.scale || 100}
            onChange={onChange}
          />
          {children}
        </div>
      );
    case 'table-of-contents':
      return (
        <div
          {...attributes}
          className='table-of-contents'
          style={style}
          contentEditable={false}
        >
          <p contentEditable={false}>{t['Table of Contents']}</p>
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
          <RTEColumn
            i18n={i18n}
            paddingLeft={element.left || 0}
            paddingRight={element.right || 0}
            paddingTop={element.top || 0}
            paddingBottom={element.bottom || 0}
            onChange={onChange}
            showGridlines
          >
            {children}
          </RTEColumn>
        </div>
      );
    case 'horizontal-separator':
      return (
        <div {...attributes} style={style} contentEditable={false}>
          <hr />
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
    case 'paragraph':
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
    default:
      return (
        <div style={style} {...attributes}>
          {children}
        </div>
      );
  }
};

export const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.textSize === 'heading-one') {
    children = <h1>{children}</h1>;
  }
  if (leaf.textSize === 'heading-two') {
    children = <h2>{children}</h2>;
  }
  if (leaf.textSize === 'heading-three') {
    children = <h3>{children}</h3>;
  }
  if (leaf.textSize === 'heading-four') {
    children = <h4>{children}</h4>;
  }
  if (leaf.bold) {
    children = <b>{children}</b>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <i>{children}</i>;
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
  const i18n = getTranslationsFromUrl(window.location.href, 'pages');

  return nodes.map((node, idx) => {
    if (Text.isText(node)) {
      return (
        <Leaf leaf={node} key={node.text}>
          {node.text}
        </Leaf>
      );
    }

    if (node.children) {
      const children = node.children.map((node) => serialize([node]));
      return (
        <Leaf leaf={node} key={idx}>
          <Element element={node} i18n={i18n}>
            {children}
          </Element>
        </Leaf>
      );
    } else {
      return (
        <Leaf leaf={node} key={idx}>
          <Element element={node} i18n={i18n} />
        </Leaf>
      );
    }
  });
};

export const emptyParagraph: SlateElement[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

export const serializeToPlainText = (nodes: Node[]) => {
  return nodes.map((n) => Node.string(n)).join('\n');
};
