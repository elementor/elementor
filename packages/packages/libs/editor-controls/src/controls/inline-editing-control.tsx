import * as React from 'react';
import { type ComponentProps, useCallback, useEffect, useRef } from 'react';
import { htmlV2PropTypeUtil, parseHtmlChildren } from '@elementor/editor-props';
import { Box, type SxProps, type Theme } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import { InlineEditor } from '../components/inline-editor';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

const CHILDREN_PARSE_DEBOUNCE_MS = 300;

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
		const { value, setValue } = useBoundProp( htmlV2PropTypeUtil );
		const content = value?.content ?? '';
		const parseTimerRef = useRef< ReturnType< typeof setTimeout > >();

		const handleChange = useCallback(
			( newValue: unknown ) => {
				const html = ( newValue ?? '' ) as string;

				setValue( {
					content: html || null,
					children: value?.children ?? [],
				} );

				clearTimeout( parseTimerRef.current );

				parseTimerRef.current = setTimeout( () => {
					const parsed = parseHtmlChildren( html );

					setValue( {
						content: parsed.content || null,
						children: parsed.children,
					} );
				}, CHILDREN_PARSE_DEBOUNCE_MS );
			},
			[ setValue, value?.children ]
		);

		useEffect( () => () => clearTimeout( parseTimerRef.current ), [] );

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
						},
						'.strip-styles *': {
							all: 'unset',
						},
						...sx,
					} }
					{ ...attributes }
					{ ...props }
				>
					<InlineEditor value={ content } setValue={ handleChange } />
				</Box>
			</ControlActions>
		);
	}
);
