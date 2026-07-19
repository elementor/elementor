import * as React from 'react';
import { type ComponentProps, useCallback } from 'react';
import { htmlV3PropTypeUtil, parseHtmlChildren, stringPropTypeUtil } from '@elementor/editor-props';
import { Box, type SxProps, type Theme } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { InlineEditor } from '../components/inline-editor';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const InlineEditingControl = createControl(
	( {
		sx,
		attributes,
		props,
	}: {
		sx?: SxProps< Theme >;
		attributes?: Record< string, string >;
		props?: ComponentProps< 'div' >;
	} ) => {
		const { value, setValue, placeholder } = useBoundProp( htmlV3PropTypeUtil );
		const content = stringPropTypeUtil.extract( value?.content ?? null ) ?? '';

		const handleChange = useCallback(
			( newValue: unknown ) => {
				const html = ( newValue ?? '' ) as string;
				const parsed = parseHtmlChildren( html );

				setValue( {
					content: parsed.content ? stringPropTypeUtil.create( parsed.content ) : null,
					children: parsed.children,
				} );
			},
			[ setValue ]
		);

		return (
			<ControlActions>
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
						'& .ProseMirror': {
							minHeight: '70px',
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
					} }
					{ ...attributes }
					{ ...props }
				>
					<InlineEditor
						value={ content }
						setValue={ handleChange }
						placeholder={ placeholder?.content?.value ?? null }
					/>
				</Box>
			</ControlActions>
		);
	}
);
