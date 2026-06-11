import type { ReactNode } from "react";

/** Renders **bold** segments and line breaks from assistant messages. */
export function ChatMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx}>
          {lineIdx > 0 && <br />}
          {renderInline(line)}
        </span>
      ))}
    </>
  );
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
