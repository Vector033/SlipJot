/** Keeps Thai clauses together so line breaks land cleanly between words/phrases without awkward orphans. */
export function ThaiPhrases({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split("|");
  return (
    <>
      {parts.map((raw, i) => {
        const leadSpace = raw.startsWith(" ");
        const phrase = raw.trim();
        if (!phrase) return null;
        return (
          <span key={i}>
            {i > 0 && (leadSpace ? " " : <wbr />)}
            <span className={`inline-block ${className}`}>{phrase}</span>
          </span>
        );
      })}
    </>
  );
}
