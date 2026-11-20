import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createEditor, Editor, Transforms, type Descendant, type Node } from 'slate';
import { normalizeAnnotation } from './src/lib/slate/annotation.ts';

test('imported plain text remains editable', () => {
  const editor = createEditor();
  editor.children = normalizeAnnotation([
    { text: '[B-roll footage of a crowd]' },
  ]) as Descendant[];
  Transforms.select(editor, Editor.end(editor, []));
  editor.insertText('!');

  assert.equal(Editor.string(editor, []), '[B-roll footage of a crowd]!');
  assert.deepEqual(editor.children, [
    { type: 'paragraph', children: [{ text: '[B-roll footage of a crowd]!' }] },
  ]);
});

test('preserves marked text and existing blocks in order', () => {
  const paragraph = { type: 'paragraph', children: [{ text: 'Block' }] };
  const result = normalizeAnnotation([
    { text: 'Before ' },
    { text: 'bold', bold: true },
    paragraph,
    { text: 'After' },
  ] as Node[]);

  assert.deepEqual(result, [
    {
      type: 'paragraph',
      children: [{ text: 'Before ' }, { text: 'bold', bold: true }],
    },
    paragraph,
    { type: 'paragraph', children: [{ text: 'After' }] },
  ]);
});

test('an empty annotation has an editable paragraph', () => {
  assert.deepEqual(normalizeAnnotation([]), [
    { type: 'paragraph', children: [{ text: '' }] },
  ]);
});
