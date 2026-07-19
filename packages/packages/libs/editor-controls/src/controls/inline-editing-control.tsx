import * as React from 'react';
import { type ComponentProps, useCallback, useEffect, useMemo, useRef } from 'react';
import { htmlV3PropTypeUtil, parseHtmlChildren, stringPropTypeUtil } from '@elementor/editor-props';
import { Box, type SxProps, type Theme } from '@elementor/ui';
import { debounce } from '@elementor/utils';

import { useBoundProp } from '../bound-prop-context';
import { InlineEditor } from '../components/inline-editor';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

const LIVE_SYNC_DEBOUNCE_MS = 300;
const INLINE_ELEMENT_TAGS = [ 'span', 'b', 'strong', 'i', 'em', 'u', 'a', 'del', 'sup', 'sub', 's' ];

function mayHaveInlineChildren( html: string ): boolean {
	if ( ! html ) {
		return false;
	}

	const lowerHtml = html.toLowerCase();

	return INLINE_ELEMENT_TAGS.some( ( tag ) => lowerHtml.includes( `<${ tag }` ) );
}

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

		// `setValue` from `useBoundProp` isn't referentially stable across renders. Reading it
		// through a ref keeps the debounced sync below stable, so it's created once and never
		// leaks a pending timer, which otherwise shows up as the widget flickering while idle.
		const setValueRef = useRef( setValue );
		setValueRef.current = setValue;

		const childrenRef = useRef( value?.children ?? [] );
		childrenRef.current = value?.children ?? [];

		const lastHtmlRef = useRef( content );
		const lastSyncedHtmlRef = useRef( content );

		const applyLiveSync = useCallback( ( html: string ) => {
			if ( html === lastSyncedHtmlRef.current ) {
				return;
			}

			lastSyncedHtmlRef.current = html;

			setValueRef.current( {
				content: html ? stringPropTypeUtil.create( html ) : null,
				children: mayHaveInlineChildren( html ) ? childrenRef.current : [],
			} );
		}, [] );

		const debouncedLiveSync = useMemo( () => debounce( applyLiveSync, LIVE_SYNC_DEBOUNCE_MS ), [ applyLiveSync ] );

		const commitValue = useCallback( () => {
			debouncedLiveSync.cancel();

			const html = lastHtmlRef.current;

			if ( html === lastSyncedHtmlRef.current ) {
				return;
			}

			const parsed = parseHtmlChildren( html );

			lastSyncedHtmlRef.current = parsed.content;

			setValueRef.current( {
				content: parsed.content ? stringPropTypeUtil.create( parsed.content ) : null,
				children: parsed.children,
			} );
		}, [ debouncedLiveSync ] );

		const handleChange = useCallback(
			( newValue: unknown ) => {
				const html = ( newValue ?? '' ) as string;
				lastHtmlRef.current = html;
				debouncedLiveSync( html );
			},
			[ debouncedLiveSync ]
		);

		useEffect(
			() => () => {
				commitValue();
			},
			[ commitValue ]
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
						onBlur={ commitValue }
						placeholder={ placeholder?.content?.value ?? null }
					/>
				</Box>
			</ControlActions>
		);
	}
);
