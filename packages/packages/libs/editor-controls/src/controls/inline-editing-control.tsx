import * as React from 'react';
import { type ComponentProps, useCallback, useState } from 'react';
import { escapedHtmlPropTypeUtil } from '@elementor/editor-props';
import { Box, type SxProps, type Theme } from '@elementor/ui';
import { type Editor } from '@tiptap/react';

import { useBoundProp, usePropKeyContext } from '../bound-prop-context';
import { InlineEditor } from '../components/inline-editor';
import { InlineEditorToolbar } from '../components/inline-editor-toolbar';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { extractInlineHtmlContent } from '../utils/inline-editing';
import { type ControlProps } from '../utils/types';

type Props = ControlProps< {
	sx?: SxProps< Theme >;
	attributes?: Record< string, string >;
	props?: ComponentProps< 'div' >;
} >;

export const InlineEditingControl = createControl( ( { sx, attributes, props, context: { elementId } }: Props ) => {
	const { setValue, placeholder, value } = useBoundProp( escapedHtmlPropTypeUtil );
	const { value: rawValue } = usePropKeyContext();
	const content = value ?? extractInlineHtmlContent( rawValue );
	const [ editor, setEditor ] = useState< Editor | null >( null );

	const handleChange = useCallback(
		( newValue: unknown ) => {
			const html = ( newValue ?? '' ) as string;

			setValue( html );
		},
		[ setValue ]
	);

	return (
		<ControlActions>
			<Box sx={ { position: 'relative' } }>
				{ editor && editor.isEditable && (
					<InlineEditorToolbar
						editor={ editor }
						elementId={ elementId }
						sx={ ( theme: Theme ) => ( {
							boxShadow: 'none',
							border: '1px solid',
							borderColor: theme.palette.text.secondary,
							mb: 0.5,
						} ) }
						inControlPanel={ true }
					/>
				) }
				<Box
					sx={ ( theme: Theme ) => ( {
						p: 0.8,
						border: '1px solid',
						borderColor: theme.palette.text.secondary,
						borderRadius: '8px',
						transition: 'border-color .2s ease, box-shadow .2s ease',
						'&:hover': {
							borderColor: theme.palette.text.primary,
						},
						'&:focus-within': {
							borderColor: theme.palette.text.primary,
							boxShadow: `0 0 0 1px ${theme.palette.text.primary}`,
						},
						'& .ProseMirror:focus': {
							outline: 'none',
						},
						'& .ProseMirror': {
							minHeight: '100px',
							fontSize: '12px',
							'& a': {
								color: 'inherit',
							},
							'& .elementor-inline-editor-reset': {
								margin: 0,
								padding: 0,
							},
							'&.is-empty::before': {
								content: 'attr(data-placeholder)',
								color: 'text.tertiary',
								pointerEvents: 'none',
								position: 'absolute',
								opacity: 0.6,
							},
						},
						'.strip-styles *': {
							all: 'unset',
						},
						...sx,
					} ) }
					{ ...attributes }
					{ ...props }
				>
					<InlineEditor
						value={ content }
						setValue={ handleChange }
						placeholder={ placeholder ?? null }
						onEditorCreate={ setEditor }
						onEditorDestroy={ () => setEditor( null ) }
						sx={ {
							paddingBlockStart: 5,
						} }
					/>
				</Box>
			</Box>
		</ControlActions>
	);
} );
