import { useCallback, useMemo, type ReactElement } from 'react';
import { Editable, withReact, useSlate, Slate, ReactEditor } from 'slate-react';
import {
  Editor,
  Transforms,
  createEditor,
  Element as SlateElement,
  type BaseEditor,
} from 'slate';
import { Button } from '@radix-ui/themes';
import {
  CodeIcon,
  FontBoldIcon,
  FontItalicIcon,
  Link1Icon,
  QuoteIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from '@radix-ui/react-icons';
import {
  Images,
  Justify,
  JustifyLeft,
  JustifyRight,
  ListOl,
  ListUl,
  PaintBucket,
  TextCenter,
  Type,
} from 'react-bootstrap-icons';
import './SlateInput.css';
import '../Formic.css';
import type { SlateButtonProps } from '@ty/ui.ts';
import {
  ColorButton,
  HighlightColorButton,
  LinkButton,
} from './FormattingComponents.tsx';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { initialPageValue } from '@lib/pages/index.ts';
import { EmbeddedEvent } from '@components/EmbeddedEvent/EmbeddedEvent.tsx';

// This code is adapted from the rich text example at:
// https://github.com/ianstormtaylor/slate/blob/main/site/examples/richtext.tsx

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

const Element = ({ attributes, children, element, project }: any) => {
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
      return <img src={element.url} />;
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
        <EmbeddedEvent {...element} project={project}>
          {children}
        </EmbeddedEvent>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }: any) => {
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

const toggleBlock = (editor: ReactEditor, format: string) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: ReactEditor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (
  editor: ReactEditor,
  format: string,
  blockType = 'type'
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType as keyof typeof n] === format,
    })
  );

  return !!match;
};

const isMarkActive = (editor: ReactEditor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format as keyof typeof marks] === true : false;
};

const BlockButton = (props: SlateButtonProps) => {
  const editor = useSlate();
  return (
    <Button
      className={`unstyled ${
        isBlockActive(editor, props.format) ? 'active-button' : ''
      }`}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, props.format);
      }}
      type='button'
    >
      <props.icon />
    </Button>
  );
};

const MarkButton = (props: SlateButtonProps) => {
  const editor = useSlate();

  return (
    <Button
      className={`unstyled ${
        isMarkActive(editor, props.format) ? 'active-button' : ''
      }`}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, props.format);
      }}
      type='button'
    >
      <props.icon />
    </Button>
  );
};

const insertImage = (editor: BaseEditor & ReactEditor, url: string) => {
  const text = { text: '' };

  const image = [
    {
      type: 'image',
      url,
      children: [text],
    },
    {
      type: 'paragraph',
      children: [text],
    },
  ];

  Transforms.insertNodes(editor, image);
};

interface Props {
  initialValue?: any;
  onChange: (data: any) => any;
  i18n: Translations;
  children?: ReactElement | ReactElement[];
  project?: ProjectData;
}

export const SlateInput: React.FC<Props> = (props) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const renderElement = useCallback(
    (elProps: any) => <Element {...elProps} project={props.project} />,
    [props.project]
  );
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  const { t } = props.i18n;

  return (
    <div className='slate-form'>
      <Slate
        editor={editor}
        initialValue={props.initialValue || initialPageValue}
        onChange={props.onChange}
      >
        <div className='slate-toolbar'>
          {props.children}
          <MarkButton format='bold' icon={FontBoldIcon} />
          <MarkButton format='italic' icon={FontItalicIcon} />
          <MarkButton format='underline' icon={UnderlineIcon} />
          <MarkButton format='strikethrough' icon={StrikethroughIcon} />
          <MarkButton format='code' icon={CodeIcon} />
          <BlockButton format='block-quote' icon={QuoteIcon} />
          <div className='toolbar-separator' />
          <HighlightColorButton format='highlight' icon={PaintBucket} />
          <ColorButton format='color' icon={Type} />
          <div className='toolbar-separator' />
          <BlockButton format='numbered-list' icon={ListOl} />
          <BlockButton format='bulleted-list' icon={ListUl} />
          <div className='toolbar-separator' />
          <BlockButton format='left' icon={JustifyLeft} />
          <BlockButton format='center' icon={TextCenter} />
          <BlockButton format='right' icon={JustifyRight} />
          <BlockButton format='justify' icon={Justify} />
          <div className='toolbar-separator' />
          <LinkButton
            icon={Link1Icon}
            i18n={props.i18n}
            title={t['Insert link']}
            onSubmit={(url) => editor.addMark('link', url)}
          />
          <LinkButton
            icon={Images}
            i18n={props.i18n}
            title={t['Insert image']}
            onSubmit={(url) => insertImage(editor, url)}
          />
        </div>
        <Editable
          className='formic-form-textarea'
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </Slate>
    </div>
  );
};
