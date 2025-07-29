import * as React from 'react';
import { constrainedEditor } from 'constrained-editor-plugin';
import type { editor, MonacoEditor } from 'monaco-types';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { useTheme } from '@elementor/ui';
import { Editor } from '@monaco-editor/react';

import { validateCssLine } from '../utils/css-validation';
import { EditorWrapper, ResizeHandle } from './css-editor.styles';

interface CssEditorProps {
	value: string;
	onChange: ( value: string ) => void;
}

export const CssEditor = ( { value, onChange }: CssEditorProps ) => {
	const theme = useTheme();
	const activeBreakpoint = useActiveBreakpoint();
	const [ editorInstance, setEditorInstance ] = React.useState< editor.IStandaloneCodeEditor | null >( null );
	const [ monacoInstance, setMonacoInstance ] = React.useState< MonacoEditor | null >( null );
	const [ editorContent, setEditorContent ] = React.useState( `element.style {\n    ${ value }\n}` );

	const resizeRef = React.useRef< HTMLDivElement >( null );

	React.useEffect( () => {
		const newContent = `element.style {\n    ${ value }\n}`;
		setEditorContent( newContent );

		if ( editorInstance ) {
			editorInstance.setValue( newContent );
			editorInstance.setPosition( { lineNumber: 2, column: 5 } );
		}
		// eslint-disable-next-line react-compiler/react-compiler
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ activeBreakpoint, editorInstance ] );

	const handleResizeMove = React.useCallback(
		( e: MouseEvent ) => {
			if ( ! resizeRef.current ) {
				return;
			}

			const containerRect = resizeRef.current.getBoundingClientRect();
			const newHeight = Math.max( 100, e.clientY - containerRect.top );

			resizeRef.current.style.height = `${ newHeight }px`;

			if ( editorInstance ) {
				editorInstance.layout();
			}
		},
		[ editorInstance ]
	);

	const handleResizeEnd = React.useCallback( () => {
		document.removeEventListener( 'mousemove', handleResizeMove );
		document.removeEventListener( 'mouseup', handleResizeEnd );
	}, [ handleResizeMove ] );

	const handleResizeStart = React.useCallback(
		( e: React.MouseEvent ) => {
			e.preventDefault();
			e.stopPropagation();

			document.removeEventListener( 'mousemove', handleResizeMove );
			document.removeEventListener( 'mouseup', handleResizeEnd );

			document.addEventListener( 'mousemove', handleResizeMove );
			document.addEventListener( 'mouseup', handleResizeEnd );
		},
		[ handleResizeMove, handleResizeEnd ]
	);

	React.useEffect( () => {
		return () => {
			document.removeEventListener( 'mousemove', handleResizeMove );
			document.removeEventListener( 'mouseup', handleResizeEnd );
		};
	}, [ handleResizeMove, handleResizeEnd ] );

	const handleEditorDidMount = ( editor: editor.IStandaloneCodeEditor, monaco: MonacoEditor ) => {
		setEditorInstance( editor );
		setMonacoInstance( monaco );

		const model = editor.getModel();
		if ( model ) {
			const totalLines = model.getLineCount();

			const constrainedInstance = constrainedEditor( monaco );

			constrainedInstance.initializeIn( editor );
			constrainedInstance.addRestrictionsTo( model, [
				{
					range: [ 2, 1, totalLines - 1, model.getLineContent( totalLines - 1 ).length + 1 ],
					allowMultiline: true,
				},
			] );

			editor.setPosition( { lineNumber: 2, column: 5 } );
		}

		editor.focus();
	};

	const handleChange = ( currentContent: string | undefined ) => {
		const newValue = currentContent || '';
		setEditorContent( newValue );

		const lines = newValue.split( '\n' );
		if (
			lines.length >= 2 &&
			lines[ 0 ].trim().startsWith( 'element.style' ) &&
			lines[ lines.length - 1 ].trim() === '}'
		) {
			const cssContent = lines.slice( 1, -1 ).join( '\n' );
			onChange( cssContent );

			if ( editorInstance && monacoInstance ) {
				const model = editorInstance.getModel();
				if ( model ) {
					const customMarkers: editor.IMarkerData[] = [];
					const cssLines = cssContent.split( '\n' );

					for ( let i = 0; i < cssLines.length; i++ ) {
						const lineContent = cssLines[ i ];
						const { markers: lineMarkers } = validateCssLine( lineContent, i + 2 ); // +2 to account for wrapper line
						customMarkers.push( ...lineMarkers );
					}

					monacoInstance.editor.setModelMarkers( model, 'elementor-custom-validation', customMarkers );
				}
			}
		} else {
			onChange( newValue );
		}
	};

	return (
		<EditorWrapper ref={ resizeRef }>
			<Editor
				height="100%"
				language="css"
				theme={ theme.palette.mode === 'dark' ? 'vs-dark' : 'vs' }
				value={ editorContent }
				onChange={ handleChange }
				onMount={ handleEditorDidMount }
				options={ {
					lineNumbers: 'off',
					folding: false,
					showFoldingControls: 'never',
					scrollBeyondLastLine: false,
					minimap: {
						enabled: false,
					},
					fontFamily: 'Roboto, Arial, Helvetica, Verdana, sans-serif',
					fontSize: 12,
					padding: {
						top: 8,
						bottom: 8,
					},
					autoIndent: 'full',
					formatOnType: true,
					formatOnPaste: true,
					renderLineHighlight: 'none',
					hideCursorInOverviewRuler: true,
					fixedOverflowWidgets: true,
				} }
			/>
			<ResizeHandle onMouseDown={ handleResizeStart } />
		</EditorWrapper>
	);
};
