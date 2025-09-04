import type { editor } from 'monaco-types';

export const preventChangeOnVisualContent = ( editor: editor.IStandaloneCodeEditor ) => {
	const model = editor.getModel();
	if ( ! model ) {
		return;
	}

	const decorationsCollection = editor.createDecorationsCollection();

	const applyVisualContentStyling = () => {
		const totalLines = model.getLineCount();
		const decorations = [];

		decorations.push( {
			range: {
				startLineNumber: 1,
				startColumn: 1,
				endLineNumber: 1,
				endColumn: model.getLineContent( 1 ).length + 1,
			},
			options: {
				inlineClassName: 'visual-content-dimmed',
				isWholeLine: false,
			},
		} );

		if ( totalLines > 1 ) {
			decorations.push( {
				range: {
					startLineNumber: totalLines,
					startColumn: 1,
					endLineNumber: totalLines,
					endColumn: model.getLineContent( totalLines ).length + 1,
				},
				options: {
					inlineClassName: 'visual-content-dimmed',
					isWholeLine: false,
				},
			} );
		}

		decorationsCollection.set( decorations );
	};

	applyVisualContentStyling();

	model.onDidChangeContent( () => {
		applyVisualContentStyling();
	} );

	editor.onDidChangeCursorPosition( ( e ) => {
		const totalLines = model.getLineCount();
		const position = e.position;

		if ( position.lineNumber === 1 ) {
			editor.setPosition( { lineNumber: 2, column: 1 } );
		} else if ( position.lineNumber === totalLines ) {
			editor.setPosition( {
				lineNumber: totalLines - 1,
				column: model.getLineContent( totalLines - 1 ).length + 1,
			} );
		}
	} );

	const originalPushEditOperations = model.pushEditOperations;
	model.pushEditOperations = function ( beforeCursorState, editOperations, cursorStateComputer ) {
		const totalLines = model.getLineCount();

		const filteredOperations = editOperations.filter( ( operation ) => {
			const range = operation.range;
			const affectsProtectedLine =
				range.startLineNumber === 1 ||
				range.endLineNumber === 1 ||
				range.startLineNumber === totalLines ||
				range.endLineNumber === totalLines;

			return ! affectsProtectedLine;
		} );

		return originalPushEditOperations.call( this, beforeCursorState, filteredOperations, cursorStateComputer );
	};
};
