import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	BoldIcon,
	ExternalLinkIcon,
	ItalicIcon,
	LinkIcon,
	MinusIcon,
	StrikethroughIcon,
	SubscriptIcon,
	SuperscriptIcon,
	UnderlineIcon,
} from '@elementor/icons';
import { Box, IconButton, TextField, ToggleButton, ToggleButtonGroup, Tooltip } from '@elementor/ui';
import { type Editor, useEditorState } from '@tiptap/react';
import { __ } from '@wordpress/i18n';

type InlineEditorToolbarProps = {
	editor: Editor;
};

const toolbarButtons = {
	clear: {
		label: __( 'Clear', 'elementor' ),
		icon: <MinusIcon fontSize="tiny" />,
		action: 'clear',
		method: ( editor: Editor ) => {
			editor.chain().focus().clearNodes().unsetAllMarks().run();
		},
	},
	bold: {
		label: __( 'Bold', 'elementor' ),
		icon: <BoldIcon fontSize="tiny" />,
		action: 'bold',
		method: ( editor: Editor ) => {
			editor.chain().focus().toggleBold().run();
		},
	},
	italic: {
		label: __( 'Italic', 'elementor' ),
		icon: <ItalicIcon fontSize="tiny" />,
		action: 'italic',
		method: ( editor: Editor ) => {
			editor.chain().focus().toggleItalic().run();
		},
	},
	underline: {
		label: __( 'Underline', 'elementor' ),
		icon: <UnderlineIcon fontSize="tiny" />,
		action: 'underline',
		method: ( editor: Editor ) => {
			editor.chain().focus().toggleUnderline().run();
		},
	},
	strike: {
		label: __( 'Strikethrough', 'elementor' ),
		icon: <StrikethroughIcon fontSize="tiny" />,
		action: 'strike',
		method: ( editor: Editor ) => {
			editor.chain().focus().toggleStrike().run();
		},
	},
	superscript: {
		label: __( 'Superscript', 'elementor' ),
		icon: <SuperscriptIcon fontSize="tiny" />,
		action: 'superscript',
		method: ( editor: Editor ) => {
			editor.chain().focus().toggleSuperscript().run();
		},
	},
	subscript: {
		label: __( 'Subscript', 'elementor' ),
		icon: <SubscriptIcon fontSize="tiny" />,
		action: 'subscript',
		method: ( editor: Editor ) => {
			editor.chain().focus().toggleSubscript().run();
		},
	},
	link: {
		label: __( 'Link', 'elementor' ),
		icon: <LinkIcon fontSize="tiny" />,
		action: 'link',
		method: null,
	},
} as const;

type ToolbarButtonKeys = keyof typeof toolbarButtons;

type FormatAction = Omit< ToolbarButtonKeys, 'clear' >;

const { clear: clearButton, ...formatButtons } = toolbarButtons;

const possibleFormats: FormatAction[] = Object.keys( formatButtons ) as FormatAction[];

export const InlineEditorToolbar = ( { editor }: InlineEditorToolbarProps ) => {
	const [ isLinkMode, setIsLinkMode ] = useState( false );
	const [ urlValue, setUrlValue ] = useState( '' );
	const [ toolbarWidth, setToolbarWidth ] = useState< number | null >( null );
	const inputRef = useRef< HTMLInputElement >( null );
	const toolbarRef = useRef< HTMLDivElement >( null );

	const editorState = useEditorState( {
		editor,
		selector: ( ctx ) => possibleFormats.filter( ( format ) => ctx.editor.isActive( format ) ),
	} );

	const formatButtonsList = useMemo( () => Object.values( formatButtons ), [] );

	useEffect( () => {
		if ( isLinkMode ) {
			requestAnimationFrame( () => inputRef.current?.focus() );
		}
	}, [ isLinkMode ] );

	const handleLinkClick = () => {
		if ( toolbarRef.current ) {
			setToolbarWidth( toolbarRef.current.offsetWidth );
		}
		const currentUrl = editor.getAttributes( 'link' ).href || '';
		setUrlValue( currentUrl );
		setIsLinkMode( true );
	};

	const handleUrlSubmit = () => {
		if ( urlValue ) {
			editor.chain().focus().setLink( { href: urlValue } ).run();
		} else {
			editor.chain().focus().unsetLink().run();
		}
		setIsLinkMode( false );
	};

	const handleKeyDown = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' ) {
			handleUrlSubmit();
		} else if ( event.key === 'Escape' ) {
			setIsLinkMode( false );
		}
	};

	const handleButtonClick = ( button: ( typeof formatButtonsList )[ number ] ) => {
		if ( button.action === 'link' ) {
			handleLinkClick();
		} else {
			button.method?.( editor );
		}
	};

	return (
		<Box
			ref={ toolbarRef }
			sx={ {
				position: 'absolute',
				top: -40,
				display: 'inline-flex',
				gap: 0.5,
				padding: 0.5,
				borderRadius: 1,
				backgroundColor: 'background.paper',
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
				alignItems: 'center',
				...( isLinkMode && toolbarWidth ? { width: toolbarWidth } : {} ),
			} }
		>
			{ isLinkMode ? (
				<>
					<TextField
						value={ urlValue }
						onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => setUrlValue( e.target.value ) }
						onKeyDown={ handleKeyDown }
						onBlur={ handleUrlSubmit }
						size="tiny"
						placeholder={ __( 'Type a URL', 'elementor' ) }
						inputProps={ { ref: inputRef } }
						sx={ { flex: 1 } }
					/>
					<ToggleButton
						size="tiny"
						value="open"
						onClick={ () => window.open( urlValue, '_blank' ) }
						disabled={ ! urlValue }
						aria-label={ __( 'Open URL', 'elementor' ) }
					>
						<ExternalLinkIcon fontSize="tiny" />
					</ToggleButton>
				</>
			) : (
				<>
					<Tooltip title={ clearButton.label } placement="top">
						<IconButton aria-label={ clearButton.label } onClick={ () => clearButton.method( editor ) } size="tiny">
							{ clearButton.icon }
						</IconButton>
					</Tooltip>
					<ToggleButtonGroup
						value={ editorState }
						size="tiny"
						sx={ {
							display: 'flex',
							gap: 0.5,
						} }
					>
						{ formatButtonsList.map( ( button ) => (
							<Tooltip title={ button.label } key={ button.action } placement="top">
								<ToggleButton
									value={ button.action }
									aria-label={ button.label }
									size="tiny"
									onClick={ () => handleButtonClick( button ) }
								>
									{ button.icon }
								</ToggleButton>
							</Tooltip>
						) ) }
					</ToggleButtonGroup>
				</>
			) }
		</Box>
	);
};
