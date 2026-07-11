import { useState, useEffect, useCallback, useRef } from "react";
import { Shell } from "./components/Shell";

interface ShoppingItem {
  id: string;
  text: string;
  createdAt: number;
}

const STORAGE_KEY = "shopping_list_items";

function loadItems(): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveItems(items: ShoppingItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function App() {
  const [items, setItems] = useState<ShoppingItem[]>(loadItems);
  const [input, setInput] = useState("");
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const addItem = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      text,
      createdAt: Date.now(),
    };
    setItems((prev) => [newItem, ...prev]);
    setInput("");
    inputRef.current?.focus();
  }, [input]);

  const removeItem = useCallback((id: string) => {
    setRemoving((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 400);
  }, []);

  const clearAll = useCallback(() => {
    const allIds = new Set(items.map((i) => i.id));
    setRemoving(allIds);
    setTimeout(() => {
      setItems([]);
      setRemoving(new Set());
    }, 400);
  }, [items]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <Shell>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Shopping List
          </h1>
          <p style={{ color: "var(--muted)" }} className="text-sm">
            Add what you need, tick it off when done.
          </p>
        </div>

        {/* Input area */}
        <div className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add an item…"
            className="flex-1 px-4 py-3 text-base outline-none transition-all"
            style={{
              background: "var(--panel)",
              border: "1.5px solid var(--line)",
              borderRadius: "0.75rem",
              color: "var(--ink)",
            }}
            autoFocus
          />
          <button
            onClick={addItem}
            disabled={!input.trim()}
            className="px-5 py-3 font-semibold text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--accent)",
              borderRadius: "0.75rem",
              border: "none",
            }}
          >
            Add
          </button>
        </div>

        {/* Item count + clear */}
        {items.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              {items.length} item{items.length !== 1 ? "s" : ""} remaining
            </span>
            <button
              onClick={clearAll}
              className="text-sm font-medium cursor-pointer transition-opacity hover:opacity-70"
              style={{
                color: "var(--error)",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Items list */}
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const isRemoving = removing.has(item.id);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3.5 transition-all"
                style={{
                  background: "var(--panel)",
                  border: "1.5px solid var(--line)",
                  borderRadius: "1.25rem",
                  opacity: isRemoving ? 0 : 1,
                  transform: isRemoving ? "translateX(40px) scale(0.95)" : "translateX(0) scale(1)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full cursor-pointer transition-all hover:scale-110"
                  style={{
                    border: "2px solid var(--line-strong)",
                    background: "transparent",
                    padding: 0,
                  }}
                  aria-label={`Mark "${item.text}" as done`}
                >
                  {isRemoving && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="var(--success)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" />
                    </svg>
                  )}
                </button>

                {/* Text */}
                <span
                  className="flex-1 text-base"
                  style={{
                    textDecoration: isRemoving ? "line-through" : "none",
                    color: isRemoving ? "var(--muted)" : "var(--ink)",
                    transition: "color 0.3s ease",
                  }}
                >
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            style={{ color: "var(--muted)" }}
          >
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-lg font-semibold mb-1" style={{ color: "var(--ink)" }}>
              Your list is empty
            </p>
            <p className="text-sm">
              Type an item above and hit Add or press Enter.
            </p>
          </div>
        )}
      </div>
    </Shell>
  );
}
