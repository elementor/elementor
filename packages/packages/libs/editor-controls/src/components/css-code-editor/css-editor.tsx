import * as React from 'react';
import type { editor, MonacoEditor } from 'monaco-types';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { useTheme } from '@elementor/ui';
import { Editor } from '@monaco-editor/react';

import { EditorWrapper } from './css-editor.styles';
import { setCustomSyntaxRules, validate } from './css-validation';
import { ResizeHandleComponent } from './resize-handle';

type CssEditorProps = {
	value: string;
	onChange: ( value: string ) => void;
};

const setVisualContent = ( value: string ): string => {
	const trimmed = value.trim();
	return `element.style {\n${ trimmed ? '  ' + trimmed.replace( /\n/g, '\n  ' ) + '\n' : '  \n' }}`;
};

const getActual = ( value: string ): string => {
	const lines = value.split( '\n' );
	if ( lines.length < 2 ) {
		return '';
	}
	return lines
		.slice( 1, -1 )
		.map( ( line ) => line.replace( /^ {2}/, '' ) )
		.join( '\n' );
};

const preventChangeOnVisualContent = ( editor: editor.IStandaloneCodeEditor, monaco: MonacoEditor ) => {
	const model = editor.getModel();
	if ( ! model ) {
		return;
	}

	editor.onKeyDown( ( e ) => {
		const position = editor.getPosition();
		if ( ! position ) {
			return;
		}

		const totalLines = model.getLineCount();
		const isInProtectedRange = position.lineNumber === 1 || position.lineNumber === totalLines;

		if ( isInProtectedRange ) {
			const allowedKeys = [
				monaco.KeyCode.UpArrow,
				monaco.KeyCode.DownArrow,
				monaco.KeyCode.LeftArrow,
				monaco.KeyCode.RightArrow,
				monaco.KeyCode.Home,
				monaco.KeyCode.End,
				monaco.KeyCode.PageUp,
				monaco.KeyCode.PageDown,
				monaco.KeyCode.Tab,
				monaco.KeyCode.Escape,
			];

			if ( ! allowedKeys.includes( e.keyCode ) ) {
				e.preventDefault();
				e.stopPropagation();
			}
		}
	} );
};

const createEditorDidMountHandler = (
	editorRef: React.MutableRefObject< editor.IStandaloneCodeEditor | null >,
	monacoRef: React.MutableRefObject< MonacoEditor | null >,
	debounceTimer: React.MutableRefObject< NodeJS.Timeout | null >,
	onChange: ( value: string ) => void
) => {
	return ( editor: editor.IStandaloneCodeEditor, monaco: MonacoEditor ) => {
		editorRef.current = editor;
		monacoRef.current = monaco;

		preventChangeOnVisualContent( editor, monaco );

		setCustomSyntaxRules( editor, monaco );

		editor.onDidChangeModelContent( () => {
			const code = editor.getModel()?.getValue() ?? '';
			const userContent = getActual( code );

			setCustomSyntaxRules( editor, monaco );

			const currentTimer = debounceTimer.current;
			if ( currentTimer ) {
				clearTimeout( currentTimer );
			}

			const newTimer = setTimeout( () => {
				if ( ! editorRef.current || ! monacoRef.current ) {
					return;
				}

				const hasNoErrors = validate( editorRef.current, monacoRef.current );

				if ( hasNoErrors ) {
					onChange( userContent );
				}
			}, 500 );

			debounceTimer.current = newTimer;
		} );
	};
};

export const CssEditor = ( { value, onChange }: CssEditorProps ) => {
	const theme = useTheme();
	const containerRef = React.useRef< HTMLDivElement >( null );
	const editorRef = React.useRef< editor.IStandaloneCodeEditor | null >( null );
	const monacoRef = React.useRef< MonacoEditor | null >( null );
	const debounceTimer = React.useRef< NodeJS.Timeout | null >( null );
	const activeBreakpoint = useActiveBreakpoint();

	const handleResize = React.useCallback( () => {
		editorRef.current?.layout();
	}, [] );

	const handleHeightChange = React.useCallback( ( height: number ) => {
		if ( containerRef.current ) {
			containerRef.current.style.height = `${ height }px`;
		}
	}, [] );

	const handleEditorDidMount = createEditorDidMountHandler( editorRef, monacoRef, debounceTimer, onChange );

	React.useEffect( () => {
		const timerRef = debounceTimer;
		return () => {
			const timer = timerRef.current;
			if ( timer ) {
				clearTimeout( timer );
			}
		};
	}, [] );

	return (
		<EditorWrapper ref={ containerRef }>
			<Editor
				key={ activeBreakpoint }
				height="100%"
				language="css"
				theme={ theme.palette.mode === 'dark' ? 'vs-dark' : 'vs' }
				defaultValue={ setVisualContent( value ) }
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
			<ResizeHandleComponent
				onResize={ handleResize }
				containerRef={ containerRef }
				onHeightChange={ handleHeightChange }
			/>
		</EditorWrapper>
	);
};
