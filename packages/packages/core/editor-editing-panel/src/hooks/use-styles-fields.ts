import { useMemo } from 'react';
import { type ElementID } from '@elementor/editor-elements';
import type { Props } from '@elementor/editor-props';
import { getVariantByMeta, type StyleDefinition, type StyleDefinitionVariant } from '@elementor/editor-styles';
import { type StylesProvider } from '@elementor/editor-styles-repository';

import { useClassesProp } from '../contexts/classes-prop-context';
import { useElement } from '../contexts/element-context';
import { useStyle } from '../contexts/style-context';
import { useStylesFieldTargets } from '../contexts/styles-field-targets-context';
import { StyleNotFoundUnderProviderError } from '../errors';
import { createUndoableUpdateStyles, getLocalStyleTargets } from '../utils/styles-history';
import { useStylesRerender } from './use-styles-rerender';

export const HISTORY_DEBOUNCE_WAIT = 800;

export function useStylesFields< T extends Props >( propNames: ( keyof T & string )[] ) {
	const {
		element: { id: elementId },
	} = useElement();
	const { id: styleId, meta, provider, canEdit } = useStyle();
	const classesProp = useClassesProp();
	const targetElementIds = useStylesFieldTargets();

	const { writeMeta, undoableUpdateStyles } = useMemo(
		() => ( {
			writeMeta: { breakpoint: meta.breakpoint, state: meta.state },
			undoableUpdateStyles: createUndoableUpdateStyles( { debounceWait: HISTORY_DEBOUNCE_WAIT } ),
		} ),
		[ meta.breakpoint, meta.state ]
	);

	useStylesRerender();

	const values = getProps< T >( { elementId, styleId, provider, meta, propNames } );

	const setValues = ( props: T, { history: { propDisplayName } }: { history: { propDisplayName: string } } ) => {
		const targets = targetElementIds
			? getLocalStyleTargets( targetElementIds )
			: [ { elementId, classesProp, styleId, provider } ];

		if ( ! targets.length ) {
			return;
		}

		const writes = targets.map( ( target ) => ( { target, meta: writeMeta, props } ) );

		undoableUpdateStyles( { writes, propDisplayName } );
	};

	return { values, setValues, canEdit };
}

type GetPropsArgs = {
	provider: StylesProvider | null;
	styleId: StyleDefinition[ 'id' ] | null;
	elementId: ElementID;
	meta: StyleDefinitionVariant[ 'meta' ];
	propNames: string[];
};

type NullableValues< T extends Props > = {
	[ K in keyof T ]: T[ K ] | null;
};

function getProps< T extends Props >( { styleId, elementId, provider, meta, propNames }: GetPropsArgs ) {
	if ( ! provider || ! styleId ) {
		return null;
	}

	const style = provider.actions.get( styleId, { elementId } );

	if ( ! style ) {
		throw new StyleNotFoundUnderProviderError( { context: { styleId, providerKey: provider.getKey() } } );
	}

	const variant = getVariantByMeta( style, meta );

	return Object.fromEntries(
		propNames.map( ( key ) => [ key, variant?.props[ key ] ?? null ] )
	) as NullableValues< T >;
}
