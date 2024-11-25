/// <reference types="vite-plugin-svgr/client" />

import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useCallback, useMemo } from 'react';
import BoldIcon from '../../assets/bold.svg';
import ItalicIcon from '../../assets/italic.svg';
import UnorderedListIcon from '../../assets/list-unordered.svg';
import OrderedList from '../../assets/list-ordered.svg';
import LinkIcon from '../../assets/link.svg';
import UnlinkIcon from '../../assets/link-unlink.svg';
import UndoIcon from '../../assets/undo.svg';
import RedoIcon from '../../assets/redo.svg';
import DOMPurify from 'dompurify';
import Spinner from '../Spinner';
import styles from './styles.module.css';

const MenuBar = ({ editor }: { editor: Editor }) => {
  const setLink = useCallback(() => {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();

      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="control-group">
      <div className={styles.buttonGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <BoldIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <ItalicIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          <UnorderedListIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          <OrderedList />
        </button>
        <button
          onClick={setLink}
          className={editor.isActive('link') ? 'is-active' : ''}
        >
          <LinkIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
        >
          <UnlinkIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <UndoIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <RedoIcon />
        </button>
      </div>
    </div>
  );
};

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  Link.configure({
    openOnClick: true,
    autolink: true,
  }),
];

const TipTap = ({
  html,
  setHtml,
  isFetching,
}: {
  html: string;
  setHtml: (val: string) => void;
  isFetching: boolean;
}) => {
  const sanitizedHTML = useMemo(() => DOMPurify.sanitize(html), [html]);
  const editor = useEditor(
    {
      extensions,
      content: sanitizedHTML,
      onUpdate: (update) => setHtml(update.editor.getHTML()),
    },
    [sanitizedHTML]
  );

  if (!editor) {
    return null;
  }

  return (
    <>
      <MenuBar editor={editor} />
      {isFetching ? <Spinner /> : <EditorContent editor={editor} />}
    </>
  );
};

export default TipTap;
