import * as React from 'react';
import type { editor, MonacoEditor } from 'monaco-types';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { useTheme } from '@elementor/ui';
import { Editor } from '@monaco-editor/react';

import { EditorWrapper } from './css-editor.styles';
import { clearMarkersFromVisualContent, setCustomSyntaxRules, validate } from './css-validation';
import { ResizeHandleComponent } from './resize-handle';
import { preventChangeOnVisualContent } from './visual-content-change-protection';

type CssEditorProps = {
	value: string;
	onChange: ( value: string, isValid: boolean ) => void;
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

const createEditorDidMountHandler = (
	editorRef: React.MutableRefObject< editor.IStandaloneCodeEditor | null >,
	monacoRef: React.MutableRefObject< MonacoEditor | null >
) => {
	return ( editor: editor.IStandaloneCodeEditor, monaco: MonacoEditor ) => {
		editorRef.current = editor;
		monacoRef.current = monaco;

		preventChangeOnVisualContent( editor );

		setCustomSyntaxRules( editor, monaco );

		monaco.editor.onDidChangeMarkers( () => {
			setTimeout( () => clearMarkersFromVisualContent( editor, monaco ), 0 );
		} );

		editor.setPosition( { lineNumber: 2, column: ( editor.getModel()?.getLineContent( 2 ).length ?? 0 ) + 1 } );
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

	const handleEditorChange = () => {
		if ( ! editorRef.current || ! monacoRef.current ) {
			return;
		}

		const code = editorRef.current?.getModel()?.getValue() ?? '';
		const userContent = getActual( code );

		setCustomSyntaxRules( editorRef?.current, monacoRef.current );

		const currentTimer = debounceTimer.current;
		if ( currentTimer ) {
			clearTimeout( currentTimer );
		}

		const newTimer = setTimeout( () => {
			if ( ! editorRef.current || ! monacoRef.current ) {
				return;
			}

			const hasNoErrors = validate( editorRef.current, monacoRef.current );

			onChange( userContent, hasNoErrors );
		}, 500 );

		debounceTimer.current = newTimer;
	};

	const handleEditorDidMount = createEditorDidMountHandler( editorRef, monacoRef );

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
				theme={ theme.palette.mode === 'dark' ? 'vs-dark' : 'modern-light' }
				value={ setVisualContent( value ) }
				onMount={ handleEditorDidMount }
				onChange={ handleEditorChange }
				options={ {
					lineNumbers: 'on',
					folding: true,
					minimap: { enabled: false },
					fontFamily: 'Roboto, Arial, Helvetica, Verdana, sans-serif',
					fontSize: 12,
					renderLineHighlight: 'none',
					hideCursorInOverviewRuler: true,
					fixedOverflowWidgets: true,
					suggestFontSize: 10,
					suggestLineHeight: 14,
					stickyScroll: {
						enabled: false,
					},
					lineDecorationsWidth: 2,
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
