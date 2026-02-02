import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import { type ElementID, getContainer, getElementSetting } from '@elementor/editor-elements';
import { type LinkPropValue } from '@elementor/editor-props';
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
import {
	Box,
	IconButton,
	type SxProps,
	type Theme,
	ToggleButton,
	ToggleButtonGroup,
	toggleButtonGroupClasses,
	Tooltip,
	usePopupState,
} from '@elementor/ui';
import { type Editor, useEditorState } from '@tiptap/react';
import { __ } from '@wordpress/i18n';

import { UrlPopover } from './url-popover';

export type InlineEditorToolbarProps = {
	editor: Editor;
	elementId?: ElementID;
	sx?: SxProps< Theme >;
};

type ToolbarButtonKeys = keyof typeof toolbarButtons;

type FormatAction = Omit< ToolbarButtonKeys, 'clear' >;

export const InlineEditorToolbar = ( { editor, elementId, sx = {} }: InlineEditorToolbarProps ) => {
	const [ urlValue, setUrlValue ] = useState( '' );
	const [ openInNewTab, setOpenInNewTab ] = useState( false );
	const toolbarRef = useRef< HTMLDivElement >( null );
	const linkPopupState = usePopupState( { variant: 'popover' } );
	const isElementClickable = elementId ? checkIfElementIsClickable( elementId ) : false;

	const editorState = useEditorState( {
		editor,
		selector: ( ctx ) => possibleFormats.filter( ( format ) => ctx.editor.isActive( format ) ),
	} );

	const formatButtonsList = useMemo( () => {
		const buttons = Object.values( formatButtons );

		if ( isElementClickable ) {
			return buttons.filter( ( button ) => button.action !== 'link' );
		}

		return buttons;
	}, [ isElementClickable ] );

	const handleLinkClick = () => {
		const linkAttrs = editor.getAttributes( 'link' );
		setUrlValue( linkAttrs.href || '' );
		setOpenInNewTab( linkAttrs.target === '_blank' );
		linkPopupState.open( toolbarRef.current );
	};

	const handleUrlChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setUrlValue( event.target.value );
	};

	const handleToggleNewTab = () => {
		setOpenInNewTab( ! openInNewTab );
	};

	const handleUrlSubmit = () => {
		if ( urlValue ) {
			editor
				.chain()
				.focus()
				.setLink( {
					href: urlValue,
					target: openInNewTab ? '_blank' : '_self',
				} )
				.run();
		} else {
			editor.chain().focus().unsetLink().run();
		}

		if ( elementId ) {
			window.dispatchEvent(
				new CustomEvent( 'elementor:inline-link-changed', {
					detail: { elementId },
				} )
			);
		}

		linkPopupState.close();
	};

	React.useEffect( () => {
		editor?.commands?.focus();
	}, [ editor ] );

	return (
		<Box
			ref={ toolbarRef }
			sx={ {
				display: 'inline-flex',
				gap: 0.5,
				padding: 0.5,
				borderRadius: '8px',
				backgroundColor: 'background.paper',
				boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
				alignItems: 'center',
				visibility: linkPopupState.isOpen ? 'hidden' : 'visible',
				pointerEvents: linkPopupState.isOpen ? 'none' : 'all',
				...sx,
			} }
		>
			<Tooltip title={ clearButton.label } placement="top" sx={ { borderRadius: '8px' } }>
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
					border: 'none',
					[ `& .${ toggleButtonGroupClasses.firstButton }, & .${ toggleButtonGroupClasses.middleButton }, & .${ toggleButtonGroupClasses.lastButton }` ]:
						{
							borderRadius: '8px',
							border: 'none',
							marginLeft: 0,
							'&.Mui-selected': {
								marginLeft: 0,
							},
							'& + &.Mui-selected': {
								marginLeft: 0,
							},
						},
				} }
			>
				{ formatButtonsList.map( ( button ) => (
					<Tooltip title={ button.label } key={ button.action } placement="top">
						<ToggleButton
							value={ button.action }
							aria-label={ button.label }
							size="tiny"
							onClick={ () => {
								if ( button.action === 'link' ) {
									handleLinkClick();
								} else {
									button.method?.( editor );
								}

								editor?.commands?.focus();
							} }
						>
							{ button.icon }
						</ToggleButton>
					</Tooltip>
				) ) }
			</ToggleButtonGroup>
			<UrlPopover
				popupState={ linkPopupState }
				anchorRef={ toolbarRef }
				restoreValue={ handleUrlSubmit }
				value={ urlValue }
				onChange={ handleUrlChange }
				openInNewTab={ openInNewTab }
				onToggleNewTab={ handleToggleNewTab }
			/>
		</Box>
	);
};

const checkIfElementIsClickable = ( elementId: ElementID ): boolean => {
	const container = getContainer( elementId );
	const type = container?.model.get( 'widgetType' );
	const isButton = type === 'e-button';
	const hasLink = !! getElementSetting< LinkPropValue >( elementId, 'link' )?.value?.destination;

	return isButton || hasLink;
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

const { clear: clearButton, ...formatButtons } = toolbarButtons;

const possibleFormats: FormatAction[] = Object.keys( formatButtons ) as FormatAction[];
