function encodeCharacter(char: string) {
  switch (char) {
    case ",":
      return "%2C";
    case "-":
      return "%2D";
    case "&":
      return "%26";
    default:
      return encodeURIComponent(char);
  }
}

// https://github.com/WICG/scroll-to-text-fragment#identifying-a-text-snippet
function encodeTextFragment(text: string) {
  return [",", "-", "&"].reduce(
    (encoded, char) => encoded.replaceAll(char, encodeCharacter(char)),
    encodeURIComponent(text)
  );
}

export function createTextFragment(text: string) {
  // New lines are not allowed in the text fragment.
  const newlines = text.replaceAll("\r", "").split("\n").filter(Boolean);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return `#:~:text=${encodeTextFragment(newlines[0]!)}`;
}
