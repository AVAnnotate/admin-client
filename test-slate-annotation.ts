import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createEditor,
  Editor,
  Transforms,
  type Descendant,
  type Node,
} from 'slate';
import { JSDOM } from 'jsdom';
import { normalizeAnnotation } from './src/lib/slate/annotation.ts';
import { deserialize } from './src/lib/slate/deserialize.ts';

test('Aviary TextualBody plain text remains editable', () => {
  const body = {
    type: 'TextualBody',
    value: '[B-roll footage of a crowd]',
    format: 'text/plain',
  };
  const editor = createEditor();
  editor.children = normalizeAnnotation(
    deserialize(JSDOM.fragment(body.value))
  ) as Descendant[];
  Transforms.select(editor, Editor.end(editor, []));
  editor.insertText('!');

  assert.equal(Editor.string(editor, []), '[B-roll footage of a crowd]!');
  assert.deepEqual(editor.children, [
    { type: 'paragraph', children: [{ text: '[B-roll footage of a crowd]!' }] },
  ]);
});

test('Aviary TextualBody with a bold speaker remains editable', () => {
  const body = {
    type: 'TextualBody',
    value: '<strong>Uknown speaker:</strong> : This is for all the brothers.',
    format: 'text/plain',
  };
  const editor = createEditor();
  editor.children = normalizeAnnotation(
    deserialize(JSDOM.fragment(body.value))
  ) as Descendant[];
  Transforms.select(editor, Editor.end(editor, []));
  editor.insertText('!');

  assert.deepEqual(editor.children, [
    {
      type: 'paragraph',
      children: [
        { text: 'Uknown speaker:', bold: true },
        { text: ' : This is for all the brothers.!' },
      ],
    },
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
