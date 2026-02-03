import * as React from 'react';
import { type ComponentProps } from 'react';
import { htmlV2PropTypeUtil } from '@elementor/editor-props';
import { Box, type SxProps, type Theme } from '@elementor/ui';
import { buildHtmlV2Value, type HtmlV2Value } from '@elementor/utils';

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
		const { value: rawValue, setValue } = useBoundProp();
		const extractedValue = htmlV2PropTypeUtil.extract( rawValue ?? null );
		const content = resolveContentValue( extractedValue );

		const handleChange = ( newValue: unknown ) => {
			const updatedContent = ( newValue ?? '' ) as string;

			const nextValue = buildHtmlV2Value( updatedContent, normalizeHtmlV2Value( extractedValue ), {
				parseChildren: true,
			} );
			setValue( htmlV2PropTypeUtil.create( nextValue ) );
		};

		return (
			<ControlActions>
				<Box sx={ getContainerStyles( sx ) } { ...attributes } { ...props }>
					<InlineEditor value={ content ?? '' } setValue={ handleChange } />
				</Box>
			</ControlActions>
		);
	}
);

const getContainerStyles = ( sx?: SxProps< Theme > ) => ( {
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
	},
	'.strip-styles *': {
		all: 'unset',
	},
	...sx,
} );

const normalizeHtmlV2Value = ( value: unknown ): HtmlV2Value | null =>
	typeof value === 'object' && value !== null && 'content' in value ? ( value as HtmlV2Value ) : null;

const resolveContentValue = ( value: unknown ): string | null =>
	typeof value === 'string' || value === null ? value : normalizeHtmlV2Value( value )?.content ?? '';
