import * as React from 'react';
import { constrainedEditor } from 'constrained-editor-plugin';
import type { editor, MonacoEditor } from 'monaco-types';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { useTheme } from '@elementor/ui';
import { Editor } from '@monaco-editor/react';

import { EditorWrapper, ResizeHandle } from './css-editor.styles';
import { unwrapValue, wrapInitialValue } from './css-utils';
import { validateCustomCSS, validateEditorErrors } from './css-validation';

interface CssEditorProps {
	value: string;
	onChange: ( value: string ) => void;
}

export const CssEditor = ( { value, onChange }: CssEditorProps ) => {
	const theme = useTheme();

	const editorRef = React.useRef< editor.IStandaloneCodeEditor | null >( null );
	const monacoRef = React.useRef< MonacoEditor | null >( null );
	const constrainedRef = React.useRef< ReturnType< typeof constrainedEditor > | null >( null );
	const resizeRef = React.useRef< HTMLDivElement >( null );
	const debounceTimer = React.useRef< NodeJS.Timeout | null >( null );
	const activeBreakpoint = useActiveBreakpoint();

	const handleResizeMove = React.useCallback( ( e: MouseEvent ) => {
		if ( ! resizeRef.current ) {
			return;
		}
		const containerRect = resizeRef.current.getBoundingClientRect();
		const newHeight = Math.max( 100, e.clientY - containerRect.top );
		resizeRef.current.style.height = `${ newHeight }px`;
		editorRef.current?.layout();
	}, [] );

	const handleResizeEnd = React.useCallback( () => {
		document.removeEventListener( 'mousemove', handleResizeMove );
		document.removeEventListener( 'mouseup', handleResizeEnd );
	}, [ handleResizeMove ] );

	const handleResizeStart = React.useCallback(
		( e: React.MouseEvent ) => {
			e.preventDefault();
			e.stopPropagation();
			document.addEventListener( 'mousemove', handleResizeMove );
			document.addEventListener( 'mouseup', handleResizeEnd );
		},
		[ handleResizeMove, handleResizeEnd ]
	);

	React.useEffect( () => {
		return () => {
			document.removeEventListener( 'mousemove', handleResizeMove );
			document.removeEventListener( 'mouseup', handleResizeEnd );
			if ( debounceTimer.current ) {
				clearTimeout( debounceTimer.current );
			}
		};
	}, [ handleResizeMove, handleResizeEnd ] );

	const handleEditorDidMount = ( editor: editor.IStandaloneCodeEditor, monaco: MonacoEditor ) => {
		editorRef.current = editor;
		monacoRef.current = monaco;

		const constrained = constrainedEditor( monaco );
		constrainedRef.current = constrained;

		const model = editor.getModel();
		if ( model ) {
			const lineCount = Math.max( model.getLineCount(), 3 );
			const lastEditableLine = lineCount - 1;
			const lastColumn = model.getLineMaxColumn( lastEditableLine );

			constrained.initializeIn( editor );
			constrained.addRestrictionsTo( model, [
				{ range: [ 2, 1, lastEditableLine, lastColumn ], allowMultiline: true },
			] );
		}

		validateCustomCSS( editor, monaco );

		editor.onDidChangeModelContent( () => {
			const code = editor.getModel()?.getValue() ?? '';
			const userContent = unwrapValue( code );

			validateCustomCSS( editor, monaco );

			if ( debounceTimer.current ) {
				clearTimeout( debounceTimer.current );
			}
			debounceTimer.current = setTimeout( () => {
				if ( ! editorRef.current || ! monacoRef.current ) {
					return;
				}
				const hasNoErrors = validateEditorErrors( editorRef.current, monacoRef.current );
				if ( hasNoErrors ) {
					onChange( userContent );
				}
			}, 500 );
		} );
	};

	return (
		<EditorWrapper ref={ resizeRef }>
			<Editor
				key={ activeBreakpoint }
				height="100%"
				language="css"
				theme={ theme.palette.mode === 'dark' ? 'vs-dark' : 'vs' }
				defaultValue={ wrapInitialValue( value ) }
				onMount={ handleEditorDidMount }
				options={ {
					lineNumbers: 'off',
					folding: false,
					showFoldingControls: 'never',
					minimap: { enabled: false },
					fontFamily: 'Roboto, Arial, Helvetica, Verdana, sans-serif',
					fontSize: 12,
					renderLineHighlight: 'none',
					hideCursorInOverviewRuler: true,
					fixedOverflowWidgets: true,
				} }
			/>
			<ResizeHandle
				onMouseDown={ handleResizeStart }
				aria-label="Resize editor height"
				title="Drag to resize editor height"
			/>
		</EditorWrapper>
	);
};
