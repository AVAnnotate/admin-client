import {
  Children,
  useCallback,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { Editable, withReact, useSlate, Slate, ReactEditor } from 'slate-react';
import {
  Editor,
  Transforms,
  createEditor,
  Element as SlateElement,
  type BaseEditor,
  Path,
  Node as SlateNode,
} from 'slate';
import { Button } from '@radix-ui/themes';
import { withHistory } from 'slate-history';
import {
  BookmarkIcon,
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
  ImageButton,
  LinkButton,
} from './FormattingComponents.tsx';
import type { ProjectData, Translations } from '@ty/Types.ts';
import type { ElementTypes, ImageData } from '@ty/slate.ts';
import { Element, emptyParagraph, Leaf } from '../../../lib/slate/index.tsx';
import { FormatTextButton } from '@components/FormatTextButton/FormatTextButton.tsx';
import { ToolbarTooltip } from './ToolbarTooltip.tsx';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

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
      // @ts-ignore
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      // @ts-ignore
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    // @ts-ignore
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
  const { t } = props.i18n;

  return (
    // @ts-ignore
    <ToolbarTooltip content={t.rteToolbar[props.format as string]}>
      <Button
        className={`block-button unstyled ${
          isBlockActive(editor, props.format) ? 'active-button' : ''
        }`}
        onMouseDown={(event) => {
          event.preventDefault();
          if (props.onInsert) {
            props.onInsert(editor);
          } else {
            toggleBlock(editor, props.format);
          }
        }}
        type='button'
      >
        <props.icon />
      </Button>
    </ToolbarTooltip>
  );
};

const MarkButton = (props: SlateButtonProps) => {
  const editor = useSlate();
  const { t } = props.i18n;

  return (
    // @ts-ignore
    <ToolbarTooltip content={t.rteToolbar[props.format as string]}>
      <Button
        className={`mark-button unstyled ${
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
    </ToolbarTooltip>
  );
};

const insertTableOfContents = (editor: BaseEditor & ReactEditor) => {
  const nodes = [
    {
      type: 'table-of-contents',
      children: [{ text: '' }],
    },
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  // @ts-ignore
  Transforms.insertNodes(editor, nodes);
};

const insertImage = (editor: BaseEditor & ReactEditor, image: ImageData) => {
  const nodes = [
    {
      type: 'image',
      ...image,
      children: [{ text: '' }],
    },
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  // @ts-ignore
  Transforms.insertNodes(editor, nodes);
};

const withAVAPlugin = (editor: BaseEditor & ReactEditor) => {
  const { isVoid } = editor;

  editor.isVoid = (el) => {
    if (
      ['image', 'horizontal-separator', 'table-of-contents'].includes(el.type)
    ) {
      return true;
    }

    return isVoid(el);
  };

  return editor;
};

const withColumnsPlugin = (editor: BaseEditor & ReactEditor) => {
  const { insertNodes, normalizeNode } = editor;

  // Slate intentionally includes the parent element of selected text.
  // (see https://github.com/ianstormtaylor/slate/pull/4489)
  // We don't want that, at least not when copying text from inside of a grid,
  // because we'd end up with a single, detached column. So this block overrides
  // the insertNodes method to check whether we're trying to insert a grid
  // with a single column. If so, we only insert the content from inside the column
  // and ignore the top two layers (the grid and column nodes).
  editor.insertNodes = (nodes, options) => {
    if (Array.isArray(nodes) && nodes.length > 0) {
      const grid = nodes[0] as any;
      if (grid.type === 'grid' && grid.children && grid.children.length === 1) {
        const column = grid.children[0];
        insertNodes(column.children);
      } else {
        insertNodes(nodes, options);
      }
    } else {
      insertNodes(nodes, options);
    }
  };

  // Normalize the grid node so that, if it ever ends up with only one column,
  // (e.g. when the user backspaces to remove the other column), the grid and
  // solo column are removed and all its content is brought to the top level.
  //
  // With a little more hacking, this could probably be updated to handle
  // the situation addressed by the insertNodes override above.
  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // @ts-ignore
    if (node.type === 'grid') {
      const parentPath = Path.parent(path);

      // @ts-ignore
      if (node.children.length === 1) {
        Transforms.removeNodes(editor, { at: path });

        // @ts-ignore
        const singleColumn = node.children[0];

        if (singleColumn.children && singleColumn.children.length > 0) {
          Transforms.insertNodes(editor, { text: '' }, { at: parentPath });
          Transforms.insertNodes(editor, singleColumn.children, {
            at: [...parentPath, 0],
          });
        }
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};

interface Props {
  initialValue?: any;
  onChange: (data: any) => any;
  i18n: Translations;
  children?: ReactElement | ReactElement[];
  project?: ProjectData;
  // Elements are divided into three categories based on whether they're
  // a block or inline, along with images as their own category. This
  // allows us to configure which types of elements we want to allow
  // on a per-form basis.
  elementTypes: ElementTypes[];
}

export const SlateInput: React.FC<Props> = (props) => {
  const editorRef = useRef<(BaseEditor & ReactEditor) | null>(null);

  const [currentFormat, setCurrentFormat] = useState('normal');
  const { t } = props.i18n;

  if (!editorRef.current) {
    editorRef.current = withReact(
      withHistory(withColumnsPlugin(withAVAPlugin(createEditor())))
    );
  }

  const editor = editorRef.current;

  const handleChange = (path: Path, property: string, value: any) => {
    const rootNode = SlateNode.get(editor, []);
    const currentNode = SlateNode.descendant(rootNode, path);
    console.log('Current: ', currentNode);
    const update: any = { ...currentNode };
    update[property] = value;
    Transforms.setNodes(editor, update, { at: path });
  };

  const renderElement = useCallback(
    (elProps: any) => (
      <Element
        {...elProps}
        project={props.project}
        i18n={props.i18n}
        onChange={(property: string, value: any) => {
          const path = ReactEditor.findPath(editor, elProps.element);
          handleChange(path, property, value);
        }}
      />
    ),
    [props.project]
  );
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  const handleTextFormatChange = (format: string) => {
    Editor.removeMark(editor, 'textSize');
    if (format !== 'normal') {
      Editor.addMark(editor, 'textSize', format);
    }

    setCurrentFormat(format);
  };

  return (
    <div className='slate-form'>
      <Slate
        editor={editor}
        initialValue={props.initialValue || emptyParagraph}
        onChange={props.onChange}
      >
        <div className='slate-toolbar'>
          {props.children}
          {props.elementTypes.includes('marks') && (
            <>
              <FormatTextButton
                i18n={props.i18n}
                currentFormat={currentFormat}
                onSetFormat={handleTextFormatChange}
              />
              <MarkButton format='bold' icon={FontBoldIcon} i18n={props.i18n} />
              <MarkButton
                format='italic'
                icon={FontItalicIcon}
                i18n={props.i18n}
              />
              <MarkButton
                format='underline'
                icon={UnderlineIcon}
                i18n={props.i18n}
              />
              <MarkButton
                format='strikethrough'
                icon={StrikethroughIcon}
                i18n={props.i18n}
              />
              <MarkButton format='code' icon={CodeIcon} i18n={props.i18n} />
              <BlockButton
                format='block-quote'
                icon={QuoteIcon}
                i18n={props.i18n}
              />
              <div className='toolbar-separator' />
              <HighlightColorButton
                format='highlight'
                icon={PaintBucket}
                i18n={props.i18n}
              />
              <ColorButton format='color' icon={Type} i18n={props.i18n} />
              <div className='toolbar-separator' />
            </>
          )}
          {props.elementTypes.includes('blocks') && (
            <>
              <BlockButton
                format='numbered-list'
                icon={ListOl}
                i18n={props.i18n}
              />
              <BlockButton
                format='bulleted-list'
                icon={ListUl}
                i18n={props.i18n}
              />
              <BlockButton
                format='table-of-contents'
                icon={BookmarkIcon}
                onInsert={insertTableOfContents}
                i18n={props.i18n}
              />
              <div className='toolbar-separator' />
              <BlockButton format='left' icon={JustifyLeft} i18n={props.i18n} />
              <BlockButton
                format='center'
                icon={TextCenter}
                i18n={props.i18n}
              />
              <BlockButton
                format='right'
                icon={JustifyRight}
                i18n={props.i18n}
              />
              <BlockButton format='justify' icon={Justify} i18n={props.i18n} />
              <div className='toolbar-separator' />
            </>
          )}
          {props.elementTypes.includes('marks') && (
            <LinkButton
              icon={Link1Icon}
              i18n={props.i18n}
              title={t['Insert link']}
              onSubmit={(url) => editor.addMark('link', url)}
              format='link'
            />
          )}
          {props.elementTypes.includes('images') && (
            <ImageButton
              icon={Images}
              i18n={props.i18n}
              title={t['Insert image']}
              onSubmit={(image) => insertImage(editor, image)}
            />
          )}
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
