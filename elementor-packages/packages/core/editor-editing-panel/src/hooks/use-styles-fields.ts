import { useMemo } from 'react';
import {
	createElementStyle,
	type CreateElementStyleArgs,
	deleteElementStyle,
	type ElementID,
	getElementLabel,
} from '@elementor/editor-elements';
import type { Props } from '@elementor/editor-props';
import { getVariantByMeta, type StyleDefinition, type StyleDefinitionVariant } from '@elementor/editor-styles';
import { type StylesProvider } from '@elementor/editor-styles-repository';
import { ELEMENTS_STYLES_RESERVED_LABEL } from '@elementor/editor-styles-repository';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { useClassesProp } from '../contexts/classes-prop-context';
import { useElement } from '../contexts/element-context';
import { useStyle } from '../contexts/style-context';
import { StyleNotFoundUnderProviderError, StylesProviderCannotUpdatePropsError } from '../errors';
import { useStylesRerender } from './use-styles-rerender';

export function useStylesFields< T extends Props >( propNames: ( keyof T & string )[] ) {
	const { element } = useElement();
	const { id, meta, provider, canEdit } = useStyle();
	const classesProp = useClassesProp();

	const undoableUpdateStyle = useUndoableUpdateStyle();
	const undoableCreateElementStyle = useUndoableCreateElementStyle();

	useStylesRerender();

	const values = getProps< T >( {
		elementId: element.id,
		styleId: id,
		provider,
		meta,
		propNames,
	} );

	const setValues = ( props: T ) => {
		if ( id === null ) {
			undoableCreateElementStyle( {
				elementId: element.id,
				classesProp,
				meta,
				props,
			} );

			return;
		}

		undoableUpdateStyle( {
			elementId: element.id,
			styleId: id,
			provider,
			meta,
			props,
		} );
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

type UndoableCreateElementStyleArgs = Omit< CreateElementStyleArgs, 'label' >;

function useUndoableCreateElementStyle() {
	return useMemo( () => {
		return undoable(
			{
				do: ( payload: UndoableCreateElementStyleArgs ) => {
					return createElementStyle( {
						...payload,
						label: ELEMENTS_STYLES_RESERVED_LABEL,
					} );
				},

				undo: ( { elementId }, styleId ) => {
					deleteElementStyle( elementId, styleId );
				},

				redo: ( payload, styleId ) => {
					return createElementStyle( {
						...payload,
						styleId,
						label: ELEMENTS_STYLES_RESERVED_LABEL,
					} );
				},
			},
			{
				title: ( { elementId } ) => getElementLabel( elementId ),
				subtitle: __( 'Style edited', 'elementor' ),
			}
		);
	}, [] );
}

type UndoableUpdateStyleArgs = {
	elementId: ElementID;
	styleId: StyleDefinition[ 'id' ];
	provider: StylesProvider;
	meta: StyleDefinitionVariant[ 'meta' ];
	props: Props;
};

function useUndoableUpdateStyle() {
	return useMemo( () => {
		return undoable(
			{
				do: ( { elementId, styleId, provider, meta, props }: UndoableUpdateStyleArgs ) => {
					if ( ! provider.actions.updateProps ) {
						throw new StylesProviderCannotUpdatePropsError( {
							context: { providerKey: provider.getKey() },
						} );
					}

					const style = provider.actions.get( styleId, { elementId } );

					const prevProps = getCurrentProps( style, meta );

					provider.actions.updateProps(
						{
							id: styleId,
							meta,
							props,
						},
						{ elementId }
					);

					return prevProps;
				},

				undo: ( { elementId, styleId, meta, provider }, prevProps ) => {
					provider.actions.updateProps?.( { id: styleId, meta, props: prevProps }, { elementId } );
				},
			},
			{
				title: ( { elementId } ) => getElementLabel( elementId ),
				subtitle: __( 'Style edited', 'elementor' ),
			}
		);
	}, [] );
}

function getCurrentProps( style: StyleDefinition | null, meta: StyleDefinitionVariant[ 'meta' ] ) {
	if ( ! style ) {
		return {};
	}

	const variant = getVariantByMeta( style, meta );

	const props = variant?.props ?? {};

	return structuredClone( props );
}
