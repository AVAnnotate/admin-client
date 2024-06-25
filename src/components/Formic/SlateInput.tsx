import { useCallback, useMemo } from 'react'
import { Editable, withReact, useSlate, Slate, ReactEditor } from 'slate-react'
import {
  Editor,
  Transforms,
  createEditor,
  Element as SlateElement,
  type Descendant,
} from 'slate'
import { Button } from '@radix-ui/themes'
import { FontBoldIcon, FontItalicIcon, QuoteIcon, UnderlineIcon } from '@radix-ui/react-icons'
import { ListOl, ListUl } from 'react-bootstrap-icons'
import './SlateInput.css'
import './Formic.css'

// This code is adapted from the rich text example at:
// https://github.com/ianstormtaylor/slate/blob/main/site/examples/richtext.tsx

// todo: use this? https://www.radix-ui.com/primitives/docs/components/toolbar

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

const Element = ({ attributes, children, element }: any) => {
  const style = { textAlign: element.align }
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      )
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      )
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      )
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      )
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      )
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      )
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      )
  }
}

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

const toggleBlock = (editor: ReactEditor, format: string) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  )
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  })
  let newProperties: Partial<SlateElement>
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor: ReactEditor, format: string) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor: ReactEditor, format: string, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType as keyof typeof n] === format,
    })
  )

  return !!match
}

const isMarkActive = (editor: ReactEditor, format: string) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format as keyof typeof marks] === true : false
}

interface ButtonProps {
  format: string,
  icon: React.FC
}

const BlockButton = (props: ButtonProps) => {
  const editor = useSlate()
  return (
    <Button
      className={`unstyled ${isBlockActive(editor, props.format) ? 'active-button' : ''}`}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, props.format)
      }}
      type='button'
    >
      <props.icon />
    </Button>
  )
}

const MarkButton = (props: ButtonProps) => {
  const editor = useSlate()
  return (
    <Button
      className={`unstyled ${isMarkActive(editor, props.format) ? 'active-button' : ''}`}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, props.format)
      }}
      type='button'
    >
      <props.icon />
    </Button>
  )
}

const initialValue: Descendant[] = [{
  type: 'paragraph',
  children: [
    { text: '' },
  ],
}]

interface Props {
  initialValue?: any;
  onChange: (data: any) => any;
}

export const SlateInput: React.FC<Props> = (props) => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const renderElement = useCallback((props: any) => <Element {...props} />, [])
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, [])

  return (
    <div className='slate-form'>
      <Slate
        editor={editor}
        initialValue={props.initialValue || initialValue}
        onChange={props.onChange}
      >
        <div className='slate-toolbar'>
          <MarkButton format="bold" icon={FontBoldIcon} />
          <MarkButton format="italic" icon={FontItalicIcon} />
          <MarkButton format="underline" icon={UnderlineIcon} />
          <div className='toolbar-separator' />
          <BlockButton format="block-quote" icon={QuoteIcon} />
          <BlockButton format="numbered-list" icon={ListOl} />
          <BlockButton format="bulleted-list" icon={ListUl} />
        </div>
        <Editable
          name='description'
          className='formic-form-textarea'
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </Slate>
    </div>
  )
}
