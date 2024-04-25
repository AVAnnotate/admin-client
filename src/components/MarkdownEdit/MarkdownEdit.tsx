import LightningFS, { PromisifiedFS } from '@isomorphic-git/lightning-fs';
import { useRef, useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import '@mdxeditor/editor/style.css';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  imagePlugin,
  type MDXEditorMethods,
} from '@mdxeditor/editor';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

// @ts-ignore
globalThis.Buffer = Buffer;

interface MarkdownEditProps {
  projectName: string;
  fileName: string;
}

export const MarkdownEdit = (props: MarkdownEditProps) => {
  const { projectName, fileName } = props;

  const [fs, setFs] = useState<PromisifiedFS>();
  const [markdown, setMarkdown] = useState<string | undefined>();

  const dir = `/${projectName}`;
  const mdxEditorRef = useRef<MDXEditorMethods>(null);
  const filePath = `${dir}/${fileName}`;
  const token = sessionStorage.getItem('authjs.session-token');
  const cookies = document.cookie;

  useEffect(() => {
    if (!fs) {
      const _fs = new LightningFS('fs');
      setFs(_fs.promises);
      _fs.stat(dir, undefined, (err: Error, stats: LightningFS.Stats) => {
        if (err) {
          window.location.pathname = `/projects/${projectName}`;
        } else {
          _fs.readFile(
            `${dir}/${fileName}`,
            { encoding: 'utf8' },
            (error: Error, data: string | Uint8Array) => {
              if (error) {
                console.error('Error reading file: ', error);
              } else {
                //console.log(data as string);
                setMarkdown(data as string);
              }
            }
          );
        }
      });
    }
  }, []);

  const handleSave = async () => {
    if (fs) {
      const status = await git.status({
        fs,
        dir: dir,
        filepath: fileName,
      });
      console.log(status);
      const data = mdxEditorRef.current?.getMarkdown();
      if (data) {
        console.info(data as string);
        await fs.writeFile(`${dir}/${fileName}`, data, undefined);

        const status = await git.status({
          fs,
          dir: dir,
          filepath: fileName,
        });
        console.log(status);

        await git.add({ fs, dir, filepath: fileName });
        await git.setConfig({
          fs,
          dir: dir,
          path: 'user.name',
          value: 'lwjameson',
        });

        const sha = await git.commit({
          fs,
          dir,
          message: 'Update',
        });

        if (sha) {
          const message = await git.push({
            fs,
            http,
            dir,
            url: `https://github.com/AVAnnotate/${projectName}`,
            remote: 'origin',
            ref: 'main',
            onAuth: () => ({
              username: token as string,
              password: 'x-access-token',
            }),
          });

          console.log(message);

          await git.pull({
            fs,
            http,
            dir: dir,
            ref: 'main',
            singleBranch: true,
          });
        }
      }
    }
  };

  if (fs && markdown) {
    return (
      <div>
        <h2>Edit Markdown File</h2>
        <div className='markdown-container'>
          <button onClick={handleSave}>Save</button>
          <MDXEditor
            ref={mdxEditorRef}
            markdown={markdown}
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              imagePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin(),
              codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    {' '}
                    <UndoRedo />
                    <BoldItalicUnderlineToggles />
                  </>
                ),
              }),
            ]}
            onError={(payload) => console.log(payload.error)}
          />
        </div>
      </div>
    );
  } else {
    return <div>Loading File</div>;
  }
};
