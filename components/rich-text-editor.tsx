"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = "What happened? What should change?",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose-board min-h-44 rounded-[1.4rem] px-4 py-4 text-[1.02rem] leading-7 text-ink",
      },
    },
    onUpdate({ editor: activeEditor }) {
      onChange(activeEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const current = editor.getHTML();
    if (current === value) {
      return;
    }

    editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
  }, [editor, value]);

  return (
    <div className="editor-surface rounded-[1.65rem] border border-outline bg-white/80">
      <div className="flex flex-wrap items-center gap-2 border-b border-outline px-3 py-3">
        <ToolbarButton
          label="Bold"
          active={Boolean(editor?.isActive("bold"))}
          disabled={!editor || disabled}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={Boolean(editor?.isActive("italic"))}
          disabled={!editor || disabled}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={Boolean(editor?.isActive("bulletList"))}
          disabled={!editor || disabled}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <span className="ml-auto text-xs font-medium uppercase tracking-[0.18em] text-muted">
          Emoji friendly
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition",
        active
          ? "border-court bg-court text-white"
          : "border-outline bg-white text-ink hover:border-outline-strong hover:bg-surface",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </button>
  );
}
