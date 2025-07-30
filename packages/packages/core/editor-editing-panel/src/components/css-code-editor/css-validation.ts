import type { editor, MonacoEditor } from 'monaco-types';
import { unwrapValue } from './css-utils';

const forbiddenPatterns = [
  { regex: /:hover/g, message: "Usage of :hover is not allowed." },
  { regex: /:active/g, message: "Usage of :active is not allowed." },
  { regex: /@media/g, message: "Usage of @media queries is not allowed." },
];

export function validateCustomCSS(editor: editor.IStandaloneCodeEditor, monaco: MonacoEditor): boolean {
  const model = editor.getModel();
  if (!model) return true;

  const innerText = unwrapValue(model.getValue());
  const customMarkers: editor.IMarkerData[] = [];
  const headerOffset = model.getLineContent(1).length + 1;

  forbiddenPatterns.forEach((rule) => {
    let match: RegExpExecArray | null;
    while ((match = rule.regex.exec(innerText)) !== null) {
      const startPos = model.getPositionAt(match.index + headerOffset);
      const endPos = model.getPositionAt(match.index + match[0].length + headerOffset);

      customMarkers.push({
        severity: monaco.MarkerSeverity.Error,
        message: rule.message,
        startLineNumber: startPos.lineNumber,
        startColumn: startPos.column,
        endLineNumber: endPos.lineNumber,
        endColumn: endPos.column,
      });
    }
  });

  monaco.editor.setModelMarkers(model, "custom-css-linter", customMarkers);
  return customMarkers.length === 0;
}

export function validateEditorErrors(editor: editor.IStandaloneCodeEditor, monaco: MonacoEditor): boolean {
  const model = editor.getModel();
  if (!model) return true;
  const allMarkers = monaco.editor.getModelMarkers({ resource: model.uri });
  return allMarkers.filter(marker => marker.severity === monaco.MarkerSeverity.Error).length === 0;
}
