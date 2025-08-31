import type { editor, MonacoEditor } from 'monaco-types';
import { __ } from '@wordpress/i18n';

const forbiddenPatterns = [
	{
		pattern: ':hover',
		message: __(
			'The use of pseudo-states is not permitted. Instead, switch to the desired pseudo state and add your custom code there.',
			'elementor'
		),
	},
	{
		pattern: ':active',
		message: __(
			'The use of pseudo-states is not permitted. Instead, switch to the desired pseudo state and add your custom code there.',
			'elementor'
		),
	},
	{
		pattern: '@media',
		message: __(
			'The use of @media is not permitted. Instead, switch to the desired breakpoint and add your custom code there.',
			'elementor'
		),
	},
];

export function setCustomSyntaxRules( editor: editor.IStandaloneCodeEditor, monaco: MonacoEditor ): boolean {
	const model = editor.getModel();
	if ( ! model ) {
		return true;
	}

	const customMarkers: editor.IMarkerData[] = [];

	forbiddenPatterns.forEach( ( rule ) => {
		const matches = model.findMatches( rule.pattern, true, false, true, null, true );
		matches.forEach( ( match ) => {
			customMarkers.push( {
				severity: monaco.MarkerSeverity.Error,
				message: rule.message,
				startLineNumber: match.range.startLineNumber,
				startColumn: match.range.startColumn,
				endLineNumber: match.range.endLineNumber,
				endColumn: match.range.endColumn,
				source: 'custom-css-rules',
			} );
		} );
	} );

	monaco.editor.setModelMarkers( model, 'custom-css-rules', customMarkers );
	return customMarkers.length === 0;
}

export function validate( editor: editor.IStandaloneCodeEditor, monaco: MonacoEditor ): boolean {
	const model = editor.getModel();
	if ( ! model ) {
		return true;
	}
	const allMarkers = monaco.editor.getModelMarkers( { resource: model.uri } );
	return allMarkers.filter( ( marker ) => marker.severity === monaco.MarkerSeverity.Error ).length === 0;
}

export function clearMarkersFromVisualContent( editor: editor.IStandaloneCodeEditor, monaco: MonacoEditor ): void {
	const model = editor.getModel();

	if ( ! model ) {
		return;
	}

	const allMarkers = monaco.editor.getModelMarkers( { resource: model.uri } );
	const filteredMarkers = allMarkers.filter( ( marker ) => marker.startLineNumber !== 1 );
	const nonCustomMarkers = filteredMarkers.filter( ( m ) => m.source !== 'custom-css-rules' );
	monaco.editor.setModelMarkers( model, 'css', nonCustomMarkers );
}
