export const wrapInitialValue = (value: string): string => {
  const trimmed = value.trim();
  return `element.style {\n${trimmed ? "  " + trimmed.replace(/\n/g, "\n  ") + "\n" : "  \n"}}`;
};

export const unwrapValue = (value: string): string => {
  const lines = value.split("\n");
  if (lines.length < 2) return "";
  return lines.slice(1, -1).map(line => line.replace(/^ {2}/, "")).join("\n");
};
