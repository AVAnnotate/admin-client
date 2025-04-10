import { useCallback, useRef, type ReactElement } from 'react';
import {
  Editable,
  withReact,
  useSlate,
  Slate,
  ReactEditor,
  useEditor,
} from 'slate-react';
import {
  Editor,
  Transforms,
  createEditor,
  Element as SlateElement,
  type BaseEditor,
  Path,
  Node as SlateNode,
  type TextUnit,
} from 'slate';
import { Button } from '@radix-ui/themes';
import { HistoryEditor, withHistory } from 'slate-history';
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
  ArrowCounterclockwise,
  ArrowClockwise,
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
import type { ElementTypes, ImageData, AVAEditor } from '@ty/slate.ts';
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
  const { t } = props.i18n;
  const editor = useSlate();

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
  const { t } = props.i18n;
  const editor = useSlate();

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

const insertTableOfContents = (editor: ReactEditor) => {
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

const insertImage = (editor: AVAEditor, image: ImageData) => {
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

export const updateImage = (editor: AVAEditor, image: ImageData, node: any) => {
  const rootNode = SlateNode.get(editor, []);
  const path = ReactEditor.findPath(editor, node);
  const currentNode = SlateNode.descendant(rootNode, path);

  const update: any = { ...currentNode };
  update.url = image.url;
  update.altText = image.altText;

  Transforms.setNodes(editor, update, { at: path });
};

const withAVAPlugin = (editor: ReactEditor & BaseEditor) => {
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

const withColumnsPlugin = (editor: ReactEditor & BaseEditor) => {
  const { deleteForward, deleteBackward } = editor;

  editor.deleteForward = (unit: TextUnit) => {
    const [column] = Editor.nodes(editor, {
      match: (node) =>
        !Editor.isEditor(node) &&
        SlateElement.isElement(node) &&
        // @ts-ignore
        node.type === 'column',
    });

    if (!!column && SlateElement.isElement(column[0])) {
      return;
    }

    deleteForward(unit);
  };

  editor.deleteBackward = (unit: TextUnit) => {
    const [column] = Editor.nodes(editor, {
      match: (node) =>
        !Editor.isEditor(node) &&
        SlateElement.isElement(node) &&
        // @ts-ignore
        node.type === 'column',
    });

    if (
      !!column &&
      SlateElement.isElement(column[0]) &&
      column[0].children.length === 1 &&
      // @ts-ignore
      column[0].children[0].type === 'paragraph' &&
      // @ts-ignore
      column[0].children[0].children.length === 1 &&
      // @ts-ignore
      column[0].children[0].children[0].text === ''
    ) {
      return;
    }

    deleteBackward(unit);
  };

  return editor;
};

interface Props {
  initialValue?: any;
  onChange: (data: any, format: string) => any;
  i18n: Translations;
  currentFormat: string;
  children?: ReactElement | ReactElement[];
  project?: ProjectData;
  popoverAnchor?: any;
  // Elements are divided into three categories based on whether they're
  // a block or inline, along with images as their own category. This
  // allows us to configure which types of elements we want to allow
  // on a per-form basis.
  elementTypes: ElementTypes[];
  onSetFormat(format: string): void;
}

export const SlateInput: React.FC<Props> = (props) => {
  const editorRef = useRef<(BaseEditor & ReactEditor & HistoryEditor) | null>(
    null
  );

  const { currentFormat } = props;

  const { t } = props.i18n;

  if (!editorRef.current) {
    editorRef.current = withReact(
      withHistory(withColumnsPlugin(withAVAPlugin(createEditor())))
    );
  }

  const editor = editorRef.current;
  // const editor: AVAEditor = withReact(
  //   withHistory(withColumnsPlugin(withAVAPlugin(createEditor())))
  // );

  const handleChange = (path: Path, property: string, value: any) => {
    const rootNode = SlateNode.get(editor, []);
    const currentNode = SlateNode.descendant(rootNode, path);
    if (property === 'delete') {
      // This handles column deletes. Deleting a column in a two column layout
      // Moves the children to the remaining column.
      // In a one column layout it will move the children to the parent node
      const column: any = SlateNode.get(editor, path);
      const grid: any = SlateNode.parent(rootNode, path);
      console.log('Column: ', column);
      console.log('Grid: ', grid);
      if (grid.layout.length === 2) {
        // Move children
        let updateGrid: any = JSON.parse(JSON.stringify(grid));
        updateGrid.layout = [6];

        // Find the right child
        const childIdx = updateGrid.children.findIndex(
          (c: any) => c !== column
        );
        if (childIdx > -1) {
          updateGrid.children[childIdx].children = [
            ...updateGrid.children[childIdx].children,
            ...column.children,
          ];
          const updatePath = ReactEditor.findPath(editor, grid);
          Transforms.setNodes(editor, updateGrid, { at: updatePath });

          // Remove column
          Transforms.removeNodes(editor, { at: path });
        }
      } else {
        // Get parent of grid
        const gridParent: any = SlateNode.parent(rootNode, path);

        // Move the children
        const updateParent: any = JSON.parse(JSON.stringify(gridParent));
        updateParent.children = [...updateParent.children, ...column.children];
        const parentPath = ReactEditor.findPath(editor, gridParent);
        Transforms.setNodes(editor, updateParent, { at: parentPath });

        // Remove the column
        Transforms.removeNodes(editor, { at: path });
      }
    } else {
      const update: any = { ...currentNode };
      update[property] = value;
      Transforms.setNodes(editor, update, { at: path });
    }
  };

  const renderUndoButton = () => (
    // @ts-expect-error
    <ToolbarTooltip content={t.rteToolbar['undo']}>
      <Button
        className='mark-button unstyled'
        onClick={() => editor.undo()}
        type='button'
        disabled={editor.history.undos.length === 0}
      >
        <ArrowCounterclockwise />
      </Button>
    </ToolbarTooltip>
  );

  const renderRedoButton = () => (
    // @ts-expect-error
    <ToolbarTooltip content={t.rteToolbar['redo']}>
      <Button
        className='mark-button unstyled'
        onClick={() => editor.redo()}
        type='button'
        disabled={editor.history.redos.length === 0}
      >
        <ArrowClockwise />
      </Button>
    </ToolbarTooltip>
  );

  const renderElement = useCallback(
    (elProps: any) => (
      <Element
        {...elProps}
        project={props.project}
        i18n={props.i18n}
        popoverAnchor={props.popoverAnchor}
        onChange={(property: string, value: any) => {
          const path = ReactEditor.findPath(editor, elProps.element);
          handleChange(path, property, value);
        }}
        editor={editor}
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

    props.onSetFormat(format);
  };

  const getCurrentFormat = () => {
    const marks: any = Editor.marks(editor);
    if (marks && marks['textSize']) {
      props.onSetFormat(marks['textSize']);
      return marks['textSize'];
    } else {
      props.onSetFormat('normal');
      return 'normal';
    }
  };

  const handleSlateChange = (data: any) => {
    const format = getCurrentFormat();
    props.onChange(data, format);
  };

  return (
    <div className='slate-form'>
      <Slate
        editor={editor}
        initialValue={props.initialValue || emptyParagraph}
        onChange={handleSlateChange}
      >
        <div className='slate-toolbar'>
          {props.children}
          {props.children && <div className='toolbar-separator' />}
          {renderUndoButton()}
          {renderRedoButton()}
          <div className='toolbar-separator' />
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
