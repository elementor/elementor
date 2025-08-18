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

const buildHiddenContext = ( value: string ): string => {
	const trimmed = value.trim();
	const indented = trimmed ? '  ' + trimmed.replace( /\n/g, '\n  ' ) + '\n' : '  \n';
	return `element.style {\n${ indented }}`;
};

const addVisualContextZones = ( editor: editor.IStandaloneCodeEditor ) => {
	let topZoneId: string | null = null;
	let bottomZoneId: string | null = null;

	const createLabel = ( text: string ) => {
		const node = document.createElement( 'div' );
		node.style.fontFamily = 'Roboto, Arial, Helvetica, Verdana, sans-serif';
		node.style.fontSize = '12px';
		node.style.lineHeight = '18px';
		node.style.paddingLeft = '4px';
		node.textContent = text;
		return node;
	};

	const topNode = createLabel( 'element.style {' );
	const bottomNode = createLabel( '}' );

	const refreshZones = () => {
		const model = editor.getModel();
		const lineCount = model ? model.getLineCount() : 0;
		editor.changeViewZones( ( accessor ) => {
			if ( topZoneId ) {
				accessor.removeZone( topZoneId );
			}
			if ( bottomZoneId ) {
				accessor.removeZone( bottomZoneId );
			}
			topZoneId = accessor.addZone( {
				afterLineNumber: 0,
				heightInPx: 18,
				domNode: topNode,
			} );
			bottomZoneId = accessor.addZone( {
				afterLineNumber: lineCount,
				heightInPx: 18,
				domNode: bottomNode,
			} );
		} );
	};

	refreshZones();

	const contentListener = editor.onDidChangeModelContent( () => refreshZones() );
	const layoutListener = editor.onDidLayoutChange( () => editor.layout() );

	return () => {
		editor.changeViewZones( ( accessor ) => {
			if ( topZoneId ) {
				accessor.removeZone( topZoneId );
			}
			if ( bottomZoneId ) {
				accessor.removeZone( bottomZoneId );
			}
			topZoneId = null;
			bottomZoneId = null;
		} );
		contentListener.dispose();
		layoutListener.dispose();
	};
};

// keystrokes are no longer blocked; context is rendered outside the model

const createEditorDidMountHandler = (
	editorRef: React.MutableRefObject< editor.IStandaloneCodeEditor | null >,
	monacoRef: React.MutableRefObject< MonacoEditor | null >,
	debounceTimer: React.MutableRefObject< NodeJS.Timeout | null >,
	onChange: ( value: string ) => void
) => {
	return ( editor: editor.IStandaloneCodeEditor, monaco: MonacoEditor ) => {
		editorRef.current = editor;
		monacoRef.current = monaco;

		const disposeZones = addVisualContextZones( editor );

		// Hidden backing model to preserve CSS IntelliSense context
		let hiddenModel: editor.ITextModel | null = monaco.editor.createModel( buildHiddenContext( '' ), 'css' );

		const updateHiddenModel = () => {
			const code = editor.getModel()?.getValue() ?? '';
			hiddenModel?.setValue( buildHiddenContext( code ) );
		};
		updateHiddenModel();

		setCustomSyntaxRules( editor, monaco );

		// Completion provider proxying to hidden context
		/* eslint-disable @typescript-eslint/no-explicit-any */
		const completionProvider = ( monaco.languages as any ).registerCompletionItemProvider( 'css', {
			triggerCharacters: [ ':', '-', ' ', '\n', '\t' ],
			provideCompletionItems: async ( model: any, position: any ): Promise< any > => {
				if ( model !== editorRef.current?.getModel() ) {
					return { suggestions: [] };
				}

				updateHiddenModel();

				const hiddenPosition = new monaco.Position( position.lineNumber + 1, position.column + 2 );

				try {
					const getWorker = ( monaco.languages as any ).css.getWorker as () => Promise<
						( uri: any ) => Promise< any >
					>;
					if ( ! hiddenModel ) {
						return { suggestions: [] };
					}
					const workerAccessor = await getWorker();
					const worker = await workerAccessor( hiddenModel.uri );
					const list = await worker.doComplete( hiddenModel.uri.toString(), hiddenPosition );

					const word = model.getWordUntilPosition( position );
					const defaultRange = new monaco.Range(
						position.lineNumber,
						word.startColumn,
						position.lineNumber,
						word.endColumn
					);

					const rawItems: any[] = list && Array.isArray( list.items ) ? ( list.items as any[] ) : [];
					const suggestions = rawItems.map( ( obj ) => {
						const label = String( obj.label ?? '' );
						let insertText = '';
						if ( typeof obj.insertText === 'string' ) {
							insertText = obj.insertText as string;
						} else if ( typeof obj.label === 'string' ) {
							insertText = obj.label as string;
						}
						let kind: number;
						if ( typeof obj.kind === 'number' ) {
							kind = obj.kind as number;
						} else {
							kind = ( monaco.languages as any ).CompletionItemKind.Text as number;
						}
						return { label, kind, insertText, range: defaultRange };
					} );

					return { suggestions };
				} catch {
					return { suggestions: [] };
				}
			},
		} );
		/* eslint-enable @typescript-eslint/no-explicit-any */

		editor.onDidChangeModelContent( () => {
			const userContent = editor.getModel()?.getValue() ?? '';

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

		editor.onDidDispose( () => {
			disposeZones();
			completionProvider.dispose();
			hiddenModel?.dispose();
			hiddenModel = null;
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
				defaultValue={ value }
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
