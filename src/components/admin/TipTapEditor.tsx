import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export function TipTapEditor({ value, onChange }: Props) {
  const [rawMode, setRawMode] = useState(false);
  const [raw, setRaw] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        dir: "rtl",
        class:
          "prose prose-sm max-w-none min-h-[400px] p-4 focus:outline-none [&_a]:text-primary [&_a]:underline",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setRaw(html);
      onChange(html);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && !rawMode && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
      setRaw(value);
    }
  }, [value, editor, rawMode]);

  function toggleRaw() {
    if (rawMode) {
      editor?.commands.setContent(raw, { emitUpdate: false });
      onChange(raw);
    } else {
      setRaw(editor?.getHTML() ?? "");
    }
    setRawMode(!rawMode);
  }

  function addLink() {
    const prev = editor?.getAttributes("link").href ?? "";
    const url = window.prompt("קישור (URL):", prev);
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  const btn =
    "rounded border border-input bg-background px-2 py-1 text-xs font-medium hover:bg-accent disabled:opacity-40";
  const active = "bg-primary text-primary-foreground border-primary";

  return (
    <div className="rounded-lg border border-border bg-card" dir="rtl">
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-2">
        <button type="button" className={`${btn} ${editor?.isActive("bold") ? active : ""}`} onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className={`${btn} ${editor?.isActive("italic") ? active : ""}`} onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" className={`${btn} ${editor?.isActive("underline") ? active : ""}`} onClick={() => editor?.chain().focus().toggleUnderline().run()}>U</button>
        <span className="mx-1 h-4 w-px bg-border" />
        <button type="button" className={`${btn} ${editor?.isActive("heading", { level: 2 }) ? active : ""}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" className={`${btn} ${editor?.isActive("heading", { level: 3 }) ? active : ""}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <span className="mx-1 h-4 w-px bg-border" />
        <button type="button" className={`${btn} ${editor?.isActive("bulletList") ? active : ""}`} onClick={() => editor?.chain().focus().toggleBulletList().run()}>• רשימה</button>
        <button type="button" className={`${btn} ${editor?.isActive("orderedList") ? active : ""}`} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. רשימה</button>
        <button type="button" className={`${btn} ${editor?.isActive("blockquote") ? active : ""}`} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>❝</button>
        <button type="button" className={`${btn} ${editor?.isActive("link") ? active : ""}`} onClick={addLink}>קישור</button>
        <span className="mx-1 h-4 w-px bg-border" />
        <button type="button" className={btn} onClick={() => editor?.chain().focus().undo().run()}>↶</button>
        <button type="button" className={btn} onClick={() => editor?.chain().focus().redo().run()}>↷</button>
        <span className="mx-1 h-4 w-px bg-border" />
        <button type="button" className={`${btn} ${rawMode ? active : ""}`} onClick={toggleRaw}>HTML</button>
      </div>
      {rawMode ? (
        <textarea
          dir="ltr"
          className="min-h-[400px] w-full resize-y bg-background p-4 font-mono text-xs text-foreground focus:outline-none"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            onChange(e.target.value);
          }}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
