import type { editor } from 'monaco-editor';
import { __ } from '@wordpress/i18n';

interface ValidationResult {
	hasError: boolean;
	markers: editor.IMarkerData[];
}

export const validateCssLine = ( lineContent: string, lineNumber: number ): ValidationResult => {
	const markers: editor.IMarkerData[] = [];

	if ( lineContent.includes( '@media' ) ) {
		markers.push( {
			startLineNumber: lineNumber,
			startColumn: 1,
			endLineNumber: lineNumber,
			endColumn: lineContent.length + 1,
			message: __(
				'The use of @media is not permitted. Instead, switch to the desired breakpoint and add your custom code there.',
				'elementor'
			),
			severity: 8,
		} );
		return { hasError: true, markers };
	}

	const pseudoSelectorRegex = /:(hover|active)\b/g;
	if ( pseudoSelectorRegex.test( lineContent ) ) {
		markers.push( {
			startLineNumber: lineNumber,
			startColumn: 1,
			endLineNumber: lineNumber,
			endColumn: lineContent.length + 1,
			message: __(
				'The use of pseudo-states is not permitted. Instead, switch to the desired pseudo state and add your custom code there.',
				'elementor'
			),
			severity: 8,
		} );
		return { hasError: true, markers };
	}

	return { hasError: false, markers: [] };
};
