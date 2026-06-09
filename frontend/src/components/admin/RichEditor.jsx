import React from "react";
import axios from "axios";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
    Bold,
    Italic,
    Strikethrough,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Minus,
    Link as LinkIcon,
    Link2Off,
    ImagePlus,
    Image as ImageUrlIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Undo2,
    Redo2,
    Loader2,
} from "lucide-react";
import { API } from "@/lib/api";

/**
 * Rich WYSIWYG editor used by Blog & Case Study admins.
 *
 * Storage format: HTML (sanitized by DOMPurify on render). Old markdown
 * content keeps working — readers detect "is this HTML?" by the first
 * non-whitespace char being `<` and render accordingly (see
 * InsightDetail.jsx / case-study renderer).
 *
 * The toolbar lets editors insert headings, basic marks, lists, images
 * (upload via GitHub OR by URL), links and text alignment — covering the
 * "two pics on top, two in the middle, gallery anywhere" use-case.
 */
export default function RichEditor({
    value,
    onChange,
    token,
    folder = "blog",
    minHeight = 420,
    testId = "rich-editor",
    placeholder = "Start writing… use the toolbar above to add headings, images, links and lists.",
}) {
    const fileRef = React.useRef(null);
    const [uploading, setUploading] = React.useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                codeBlock: false,
                horizontalRule: { HTMLAttributes: { class: "my-8 border-mir-border" } },
            }),
            Image.configure({
                inline: false,
                allowBase64: false,
                HTMLAttributes: { class: "rounded-none border border-mir-border my-6 max-w-full h-auto" },
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: { class: "text-mir-blue underline underline-offset-4", rel: "noopener noreferrer", target: "_blank" },
            }),
            Placeholder.configure({ placeholder }),
            TextAlign.configure({ types: ["heading", "paragraph", "image"], defaultAlignment: "left" }),
        ],
        content: value || "",
        onUpdate: ({ editor: ed }) => {
            const html = ed.getHTML();
            // Treat the empty document (just `<p></p>`) as empty so required-field validation works.
            onChange(html === "<p></p>" ? "" : html);
        },
        editorProps: {
            attributes: {
                "data-testid": `${testId}-content`,
                class:
                    "prose prose-slate max-w-none min-h-[300px] focus:outline-none " +
                    "prose-headings:font-heading prose-headings:text-mir-text " +
                    "prose-p:text-mir-textSoft prose-p:leading-relaxed " +
                    "prose-a:text-mir-blue " +
                    "prose-strong:text-mir-text " +
                    "prose-img:border prose-img:border-mir-border prose-img:my-6 prose-img:rounded-none " +
                    "prose-blockquote:border-l-mir-blue prose-blockquote:text-mir-text",
            },
        },
    });

    // Keep editor synced if the parent resets value (e.g. switching posts).
    React.useEffect(() => {
        if (!editor) return;
        if ((value || "") !== editor.getHTML().replace(/^<p><\/p>$/, "")) {
            editor.commands.setContent(value || "", { emitUpdate: false });
        }
    }, [value, editor]);

    const onImagePicked = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !editor) return;
        setUploading(true);
        const tId = toast.loading("Uploading image…");
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("folder", folder);
            const res = await axios.post(`${API}/admin/media/upload`, fd, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const url = res.data.url.startsWith("http")
                ? res.data.url
                : `${process.env.REACT_APP_BACKEND_URL.replace(/\/$/, "")}${res.data.url}`;
            const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
            editor.chain().focus().setImage({ src: url, alt }).run();
            toast.success("Image inserted.", { id: tId });
        } catch (err) {
            const status = err?.response?.status;
            const detail = err?.response?.data?.detail;
            if (status === 503) toast.error("Image storage not configured. Use 'Image from URL' instead.", { id: tId });
            else if (status === 413) toast.error("File too large (max 8 MB).", { id: tId });
            else toast.error(detail || "Upload failed.", { id: tId });
        } finally {
            setUploading(false);
        }
    };

    const insertImageFromUrl = () => {
        if (!editor) return;
        const url = window.prompt("Paste image URL (must start with https://)");
        if (!url) return;
        const trimmed = url.trim();
        if (!/^https?:\/\//i.test(trimmed)) {
            toast.error("URL must start with http:// or https://");
            return;
        }
        editor.chain().focus().setImage({ src: trimmed, alt: "" }).run();
    };

    const setLink = () => {
        if (!editor) return;
        const prev = editor.getAttributes("link").href || "";
        const url = window.prompt("Link URL (leave empty to remove):", prev);
        if (url === null) return;
        if (url.trim() === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        const trimmed = url.trim();
        const final = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
        editor.chain().focus().extendMarkRange("link").setLink({ href: final }).run();
    };

    if (!editor) {
        return (
            <div
                data-testid={`${testId}-loading`}
                className="border border-mir-border bg-white p-4 text-sm text-mir-muted"
            >
                Loading editor…
            </div>
        );
    }

    const btnBase =
        "inline-flex items-center justify-center w-8 h-8 text-mir-text border border-transparent hover:border-mir-border rounded-none transition-colors";
    const isActive = (name, attrs) => editor.isActive(name, attrs) ? " bg-mir-blue/10 text-mir-blue" : "";

    return (
        <div
            data-testid={testId}
            className="border border-mir-border bg-white focus-within:border-mir-blue"
        >
            <div
                data-testid={`${testId}-toolbar`}
                className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-mir-border bg-mir-surface"
            >
                <ToolGroup>
                    <button
                        type="button"
                        title="Heading 2"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={btnBase + isActive("heading", { level: 2 })}
                        data-testid={`${testId}-h2`}
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        title="Heading 3"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={btnBase + isActive("heading", { level: 3 })}
                        data-testid={`${testId}-h3`}
                    >
                        <Heading3 className="w-4 h-4" />
                    </button>
                </ToolGroup>

                <Divider />

                <ToolGroup>
                    <button
                        type="button"
                        title="Bold"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={btnBase + isActive("bold")}
                        data-testid={`${testId}-bold`}
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        title="Italic"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={btnBase + isActive("italic")}
                        data-testid={`${testId}-italic`}
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        title="Strikethrough"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={btnBase + isActive("strike")}
                        data-testid={`${testId}-strike`}
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>
                </ToolGroup>

                <Divider />

                <ToolGroup>
                    <button
                        type="button"
                        title="Bulleted list"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={btnBase + isActive("bulletList")}
                        data-testid={`${testId}-ul`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        title="Numbered list"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={btnBase + isActive("orderedList")}
                        data-testid={`${testId}-ol`}
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        title="Quote"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={btnBase + isActive("blockquote")}
                        data-testid={`${testId}-quote`}
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        title="Horizontal rule"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        className={btnBase}
                        data-testid={`${testId}-hr`}
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                </ToolGroup>

                <Divider />

                <ToolGroup>
                    <button
                        type="button"
                        title="Add link"
                        onClick={setLink}
                        className={btnBase + isActive("link")}
                        data-testid={`${testId}-link`}
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        title="Remove link"
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        className={btnBase}
                        data-testid={`${testId}-unlink`}
                    >
                        <Link2Off className="w-4 h-4" />
                    </button>
                </ToolGroup>

                <Divider />

                <ToolGroup>
                    <button
                        type="button"
                        title="Upload image"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className={btnBase}
                        data-testid={`${testId}-img-upload`}
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    </button>
                    <button
                        type="button"
                        title="Image from URL"
                        onClick={insertImageFromUrl}
                        className={btnBase}
                        data-testid={`${testId}-img-url`}
                    >
                        <ImageUrlIcon className="w-4 h-4" />
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onImagePicked}
                        data-testid={`${testId}-img-file-input`}
                    />
                </ToolGroup>

                <Divider />

                <ToolGroup>
                    <button
                        type="button"
                        title="Align left"
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                        className={btnBase + (editor.isActive({ textAlign: "left" }) ? " bg-mir-blue/10 text-mir-blue" : "")}
                        data-testid={`${testId}-align-left`}
                    >
                        <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        title="Align center"
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                        className={btnBase + (editor.isActive({ textAlign: "center" }) ? " bg-mir-blue/10 text-mir-blue" : "")}
                        data-testid={`${testId}-align-center`}
                    >
                        <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        title="Align right"
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                        className={btnBase + (editor.isActive({ textAlign: "right" }) ? " bg-mir-blue/10 text-mir-blue" : "")}
                        data-testid={`${testId}-align-right`}
                    >
                        <AlignRight className="w-4 h-4" />
                    </button>
                </ToolGroup>

                <Divider />

                <ToolGroup>
                    <button
                        type="button"
                        title="Undo"
                        onClick={() => editor.chain().focus().undo().run()}
                        className={btnBase}
                        data-testid={`${testId}-undo`}
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        title="Redo"
                        onClick={() => editor.chain().focus().redo().run()}
                        className={btnBase}
                        data-testid={`${testId}-redo`}
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>
                </ToolGroup>
            </div>

            <div className="p-5" style={{ minHeight }}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

function ToolGroup({ children }) {
    return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
    return <span className="mx-1 h-5 w-px bg-mir-border" />;
}
