import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import {
	BoldIcon,
	ItalicIcon,
	LinkIcon,
	MinusIcon,
	StrikethroughIcon,
	SubscriptIcon,
	SuperscriptIcon,
	UnderlineIcon,
} from '@elementor/icons';
import { Box, IconButton, ToggleButton, ToggleButtonGroup, Tooltip, usePopupState } from '@elementor/ui';
import { type Editor, useEditorState } from '@tiptap/react';
import { __ } from '@wordpress/i18n';

import { UrlPopover } from './url-popover';

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
	const [ urlValue, setUrlValue ] = useState( '' );
	const [ openInNewTab, setOpenInNewTab ] = useState( false );
	const toolbarRef = useRef< HTMLDivElement >( null );
	const popupState = usePopupState( { variant: 'popover' } );

	const editorState = useEditorState( {
		editor,
		selector: ( ctx ) => possibleFormats.filter( ( format ) => ctx.editor.isActive( format ) ),
	} );

	const formatButtonsList = useMemo( () => Object.values( formatButtons ), [] );

	const handleLinkClick = () => {
		const linkAttrs = editor.getAttributes( 'link' );
		setUrlValue( linkAttrs.href || '' );
		setOpenInNewTab( linkAttrs.target === '_blank' );
		popupState.open( toolbarRef.current );
	};

	const handleUrlChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setUrlValue( event.target.value );
	};

	const handleToggleNewTab = () => {
		setOpenInNewTab( ! openInNewTab );
	};

	const handleUrlSubmit = () => {
		if ( urlValue ) {
			editor.chain().focus().setLink( { 
				href: urlValue,
				target: openInNewTab ? '_blank' : '_self',
			} ).run();
		} else {
			editor.chain().focus().unsetLink().run();
		}
		popupState.close();
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
				visibility: popupState.isOpen ? 'hidden' : 'visible',
			} }
		>
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
							onClick={ () =>
								button.action === 'link' ? handleLinkClick() : button.method?.( editor )
							}
						>
							{ button.icon }
						</ToggleButton>
					</Tooltip>
				) ) }
			</ToggleButtonGroup>
			{ popupState.isOpen && (
				<UrlPopover
					popupState={ popupState }
					anchorRef={ toolbarRef }
					restoreValue={ handleUrlSubmit }
					value={ urlValue }
					onChange={ handleUrlChange }
					openInNewTab={ openInNewTab }
					onToggleNewTab={ handleToggleNewTab }
				/>
			) }
		</Box>
	);
};
