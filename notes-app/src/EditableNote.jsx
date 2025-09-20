import React, { useState, useRef } from "react";

// 🟢 Available block types
const blockTypes = {
  paragraph: { label: "Paragraph" },
  heading1: { label: "Heading 1" },
  todo: { label: "Todo" },
  divider: { label: "Divider" },
  table: { label: "Table" },
};

// 🟦 Editable Table Block
function EditableTable({ rows = 2, cols = 2 }) {
  const [data, setData] = useState(
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => "")
    )
  );

  const updateCell = (r, c, value) => {
    const copy = [...data];
    copy[r][c] = value;
    setData(copy);
  };

  return (
    <div style={{ margin: "10px 0", overflowX: "auto" }}>
      <table
        style={{
          borderCollapse: "collapse",
          background: "#2d2f36",
          borderRadius: "8px",
        }}
      >
        <tbody>
          {data.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td
                  key={c}
                  style={{
                    border: "1px solid #555",
                    padding: "6px 10px",
                    minWidth: "80px",
                  }}
                >
                  <input
                    value={cell}
                    onChange={(e) => updateCell(r, c, e.target.value)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "white",
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 🟡 One block (paragraph, heading, todo, etc)
function BlockEditor({ block, onUpdate, onEnter }) {
  const ref = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && block.type !== "table") {
      e.preventDefault();
      onEnter();
    }
    if (e.key === "/") {
      e.preventDefault();
      onUpdate({ ...block, showMenu: true });
    }
  };

  // 🎨 Different render depending on block type
  if (block.type === "divider") {
    return <hr style={{ border: "1px solid #555", margin: "10px 0" }} />;
  }

  if (block.type === "table") {
    return <EditableTable />;
  }

  if (block.type === "todo") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="checkbox"
          checked={block.done || false}
          onChange={(e) => onUpdate({ ...block, done: e.target.checked })}
        />
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) =>
            onUpdate({ ...block, content: e.currentTarget.textContent })
          }
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            textDecoration: block.done ? "line-through" : "none",
            color: "white",
            outline: "none",
          }}
        >
          {block.content}
        </div>
      </div>
    );
  }

  // Default: paragraph / heading
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) =>
        onUpdate({ ...block, content: e.currentTarget.textContent })
      }
      onKeyDown={handleKeyDown}
      style={{
        fontSize: block.type === "heading1" ? "22px" : "16px",
        fontWeight: block.type === "heading1" ? "bold" : "normal",
        padding: "4px 0",
        outline: "none",
        color: "white",
      }}
    >
      {block.content}
    </div>
  );
}

// 🟣 Slash command menu
function CommandMenu({ position, onSelect }) {
  const items = Object.entries(blockTypes);

  return (
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        background: "#343541",
        border: "1px solid #555",
        borderRadius: "8px",
        padding: "6px",
        zIndex: 200,
        width: "200px",
      }}
    >
      {items.map(([type, { label }]) => (
        <div
          key={type}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(type);
          }}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            cursor: "pointer",
            color: "white",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#555")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

// 📝 Main editor
export function EditableNote({ note, updateContent }) {
  const [blocks, setBlocks] = useState([
    { id: Date.now().toString(), type: "paragraph", content: "" },
  ]);
  const [menuPos, setMenuPos] = useState(null);
  const [activeBlock, setActiveBlock] = useState(null);

  const updateBlock = (id, newBlock) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...newBlock } : b))
    );
    if (newBlock.showMenu) {
      const sel = window.getSelection();
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setMenuPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
      setActiveBlock(id);
    }
  };

  const addBlockAfter = (id) => {
    const idx = blocks.findIndex((b) => b.id === id);
    const newBlock = { id: Date.now().toString(), type: "paragraph", content: "" };
    const copy = [...blocks];
    copy.splice(idx + 1, 0, newBlock);
    setBlocks(copy);
  };

  const changeBlockType = (type) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === activeBlock ? { ...b, type, showMenu: false } : b))
    );
    setMenuPos(null);
    setActiveBlock(null);
  };

  return (
    <div style={{ background: "#2d2f36", padding: "16px", borderRadius: "12px" }}>
      <input
        value={note.title}
        onChange={(e) =>
          updateContent(note.id, blocks, e.target.value)
        }
        style={{
          width: "100%",
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "12px",
          background: "transparent",
          border: "none",
          color: "white",
          outline: "none",
        }}
        placeholder="Untitled note..."
      />

      {blocks.map((block) => (
        <BlockEditor
          key={block.id}
          block={block}
          onUpdate={(b) => updateBlock(block.id, b)}
          onEnter={() => addBlockAfter(block.id)}
        />
      ))}

      {menuPos && (
        <CommandMenu position={menuPos} onSelect={changeBlockType} />
      )}
    </div>
  );
}
