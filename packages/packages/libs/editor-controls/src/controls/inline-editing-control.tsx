import * as React from 'react';
import { type ComponentProps } from 'react';
import { htmlPropTypeUtil, htmlV2PropTypeUtil, type PropType } from '@elementor/editor-props';
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
		const { value: rawValue, setValue, propType } = useBoundProp();
		const isHtmlV2 = isHtmlV2PropType( propType );
		const extractedValue = isHtmlV2
			? htmlV2PropTypeUtil.extract( rawValue ?? null )
			: htmlPropTypeUtil.extract( rawValue ?? null );
		const content = resolveContentValue( extractedValue, isHtmlV2 );

		const handleChange = ( newValue: unknown ) => {
			const updatedContent = ( newValue ?? '' ) as string;

			if ( isHtmlV2 ) {
				const nextValue = buildHtmlV2Value( updatedContent, normalizeHtmlV2Value( extractedValue ), {
					parseChildren: true,
				} );
				setValue( htmlV2PropTypeUtil.create( nextValue ) );
				return;
			}

			setValue( htmlPropTypeUtil.create( updatedContent ) );
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

const isHtmlV2PropType = ( propType: PropType ): boolean => {
	if ( propType.kind === 'union' ) {
		return Boolean( propType.prop_types?.[ htmlV2PropTypeUtil.key ] );
	}

	return 'key' in propType && propType.key === htmlV2PropTypeUtil.key;
};

const normalizeHtmlV2Value = ( value: unknown ): HtmlV2Value | null =>
	typeof value === 'object' && value !== null && 'content' in value ? ( value as HtmlV2Value ) : null;

const resolveContentValue = ( value: unknown, isHtmlV2: boolean ): string | null => {
	if ( isHtmlV2 ) {
		if ( typeof value === 'string' || value === null ) {
			return value;
		}

		return normalizeHtmlV2Value( value )?.content ?? '';
	}

	return typeof value === 'string' || value === null ? value : '';
};
