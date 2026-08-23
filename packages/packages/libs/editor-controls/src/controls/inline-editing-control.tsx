import * as React from 'react';
import { type ComponentProps, useCallback, useRef } from 'react';
import { openAngieFloatingChat } from '@elementor/editor-mcp';
import { escapedHtmlPropTypeUtil } from '@elementor/editor-props';
import { Box, Button, Stack, type SxProps, type Theme } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { useBoundProp, usePropKeyContext } from '../bound-prop-context';
import { InlineEditor } from '../components/inline-editor';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { extractInlineHtmlContent } from '../utils/inline-editing';
import { type ControlProps } from '../utils/types';

const ANGIE_TITLE_GENERATION_APP_ID = 'elementor-editor-title-generation';
const ANGIE_TITLE_GENERATION_SOURCE = 'atomic_heading_title';
const TITLE_GENERATION_MCP_NAMESPACE = 'title_generation';
const TITLE_GENERATION_MCP_SERVER_NAME = `editor-${ TITLE_GENERATION_MCP_NAMESPACE }`;

type Props = ControlProps< {
	enableAngieGenerate?: boolean;
	sx?: SxProps< Theme >;
	attributes?: Record< string, string >;
	props?: ComponentProps< 'div' >;
} >;

const buildHeadingTitleGenerationPrompt = ( elementId: string, currentTitle: string ) =>
	sprintf(
		/* translators: 1: element ID, 2: current heading title text. */
		__(
			'Generate or update the heading title for element ID %1$s. Current title: "%2$s". Use the update-heading-title tool from the title_generation MCP server to write the final title.',
			'elementor'
		),
		elementId,
		currentTitle || __( '(empty)', 'elementor' )
	);

export const InlineEditingControl = createControl(
	( { enableAngieGenerate, sx, attributes, props, context: { elementId } }: Props ) => {
		const { setValue, placeholder, value } = useBoundProp( escapedHtmlPropTypeUtil );
		const { value: rawValue } = usePropKeyContext();
		const content = value ?? extractInlineHtmlContent( rawValue );
		const generateButtonRef = useRef< HTMLButtonElement >( null );

		const handleChange = useCallback(
			( newValue: unknown ) => {
				const html = ( newValue ?? '' ) as string;

				setValue( html );
			},
			[ setValue ]
		);

		const handleGenerateClick = useCallback( () => {
			const prompt = buildHeadingTitleGenerationPrompt( elementId, content );

			void openAngieFloatingChat( {
				appId: ANGIE_TITLE_GENERATION_APP_ID,
				prompt,
				source: ANGIE_TITLE_GENERATION_SOURCE,
				mcpServers: [ TITLE_GENERATION_MCP_NAMESPACE ],
				anchorElement: generateButtonRef.current,
				aiContext: {
					whatUserSees: {
						screen: __( 'Elementor editor — heading title control', 'elementor' ),
						elementId,
						currentTitle: content,
					},
					whatUserCanDo: [
						__( 'Generate a new heading title', 'elementor' ),
						__( 'Rewrite the current heading title', 'elementor' ),
					],
				},
				widgetConfig: {
					title: __( 'Generate a title', 'elementor' ),
					subtitle: __( 'Describe the title you want, or pick a starter.', 'elementor' ),
					suggestions: {
						items: [
							{
								label: __( 'Write a punchy title', 'elementor' ),
								value: __( 'Write a punchy title', 'elementor' ),
							},
							{
								label: __( 'Make it shorter', 'elementor' ),
								value: __( 'Make it shorter', 'elementor' ),
							},
						],
					},
					closeButton: 'close',
					featuredMcpServer: TITLE_GENERATION_MCP_SERVER_NAME,
					localServers: { skipLoading: true },
					planning: { enabled: false },
					userProfileMenu: { enabled: false },
					promptLibrary: { enabled: false },
					fileUpload: { enabled: false },
					feedback: { enabled: false },
					commands: { enabled: false },
					testMode: { enabled: false },
					betaBanner: { enabled: false },
					modeSwitcher: { enabled: false, default: 'agent' },
					aiContextGuidance: { enabled: true },
				},
			} ).catch( () => {} );
		}, [ content, elementId ] );

		return (
			<ControlActions>
				<Stack gap={ 0.8 }>
					{ enableAngieGenerate ? (
						<Box sx={ { display: 'flex', justifyContent: 'flex-end' } }>
							<Button
								ref={ generateButtonRef }
								size="small"
								variant="outlined"
								onClick={ handleGenerateClick }
							>
								{ __( 'Generate', 'elementor' ) }
							</Button>
						</Box>
					) : null }
					<Box
						sx={ {
							p: 0.8,
							border: '1px solid',
							borderColor: 'grey.200',
							borderRadius: '8px',
							transition: 'border-color .2s ease, box-shadow .2s ease',
							'&:hover': {
								borderColor: 'black',
							},
							'&:focus-within': {
								borderColor: 'black',
								boxShadow: '0 0 0 1px black',
							},
							'& .ProseMirror:focus': {
								outline: 'none',
							},
							'.strip-styles *': {
								all: 'unset',
							},
							...sx,
						} }
						{ ...attributes }
						{ ...props }
					>
						<InlineEditor value={ content } setValue={ handleChange } placeholder={ placeholder ?? null } />
					</Box>
				</Stack>
			</ControlActions>
		);
	}
);
