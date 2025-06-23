import { useMemo } from 'react';
import { createElementStyle, deleteElementStyle, type ElementID, getElementLabel } from '@elementor/editor-elements';
import type { Props } from '@elementor/editor-props';
import { getVariantByMeta, type StyleDefinition, type StyleDefinitionVariant } from '@elementor/editor-styles';
import { isElementsStylesProvider, type StylesProvider } from '@elementor/editor-styles-repository';
import { ELEMENTS_STYLES_RESERVED_LABEL } from '@elementor/editor-styles-repository';
import { isExperimentActive, undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { useClassesProp } from '../contexts/classes-prop-context';
import { useElement } from '../contexts/element-context';
import { useStyle } from '../contexts/style-context';
import { StyleNotFoundUnderProviderError, StylesProviderCannotUpdatePropsError } from '../errors';
import { EXPERIMENTAL_FEATURES } from '../sync/experiments-flags';
import { useStylesRerender } from './use-styles-rerender';

export function useStylesFields< T extends Props >( propNames: ( keyof T & string )[] ) {
	const {
		element: { id: elementId },
	} = useElement();
	const { id: styleId, meta, provider, canEdit } = useStyle();

	const undoableUpdateStyle = useUndoableUpdateStyle( { elementId, meta } );
	const undoableCreateElementStyle = useUndoableCreateElementStyle( { elementId, meta } );

	useStylesRerender();

	const values = getProps< T >( { elementId, styleId, provider, meta, propNames } );

	const setValues = ( props: T, { history: { propDisplayName } }: { history: { propDisplayName: string } } ) => {
		if ( styleId === null ) {
			undoableCreateElementStyle( { props, propDisplayName } );
		} else {
			undoableUpdateStyle( { provider, styleId, props, propDisplayName } );
		}
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

type UndoableCreateElementStyleArgs = {
	props: Props;
	propDisplayName: string;
};

function useUndoableCreateElementStyle( {
	elementId,
	meta,
}: {
	elementId: ElementID;
	meta: StyleDefinitionVariant[ 'meta' ];
} ) {
	const classesProp = useClassesProp();

	return useMemo( () => {
		const isVersion331Active = isExperimentActive( EXPERIMENTAL_FEATURES.V_3_31 );

		const createStyleArgs = { elementId, classesProp, meta, label: ELEMENTS_STYLES_RESERVED_LABEL };

		return undoable(
			{
				do: ( { props }: UndoableCreateElementStyleArgs ) => {
					return createElementStyle( { ...createStyleArgs, props } );
				},

				undo: ( _, styleId ) => {
					deleteElementStyle( elementId, styleId );
				},

				redo: ( { props }, styleId ) => {
					return createElementStyle( { ...createStyleArgs, props, styleId } );
				},
			},
			{
				title: () => {
					if ( isVersion331Active ) {
						return localStyleHistoryTitlesV331.title( { elementId } );
					}
					return historyTitlesV330.title( { elementId } );
				},
				subtitle: ( { propDisplayName } ) => {
					if ( isVersion331Active ) {
						return localStyleHistoryTitlesV331.subtitle( { propDisplayName } );
					}
					return historyTitlesV330.subtitle;
				},
			}
		);
	}, [ classesProp, elementId, meta ] );
}

type UndoableUpdateStyleArgs = {
	styleId: StyleDefinition[ 'id' ];
	provider: StylesProvider;
	props: Props;
	propDisplayName: string;
};

function useUndoableUpdateStyle( {
	elementId,
	meta,
}: {
	elementId: ElementID;

	meta: StyleDefinitionVariant[ 'meta' ];
} ) {
	return useMemo( () => {
		const isVersion331Active = isExperimentActive( EXPERIMENTAL_FEATURES.V_3_31 );

		return undoable(
			{
				do: ( { provider, styleId, props }: UndoableUpdateStyleArgs ) => {
					if ( ! provider.actions.updateProps ) {
						throw new StylesProviderCannotUpdatePropsError( {
							context: { providerKey: provider.getKey() },
						} );
					}

					const style = provider.actions.get( styleId, { elementId } );

					const prevProps = getCurrentProps( style, meta );

					provider.actions.updateProps( { id: styleId, meta, props }, { elementId } );

					return prevProps;
				},

				undo: ( { provider, styleId }, prevProps ) => {
					provider.actions.updateProps?.( { id: styleId, meta, props: prevProps }, { elementId } );
				},
			},
			{
				title: ( { provider } ) => {
					if ( isVersion331Active ) {
						const isLocal = isElementsStylesProvider( provider.getKey() );

						if ( isLocal ) {
							return localStyleHistoryTitlesV331.title( { elementId } );
						}
						return defaultHistoryTitlesV331.title( { provider } );
					}
					return historyTitlesV330.title( { elementId } );
				},
				subtitle: ( { provider, styleId, propDisplayName } ) => {
					if ( isVersion331Active ) {
						const isLocal = isElementsStylesProvider( provider.getKey() );

						if ( isLocal ) {
							return localStyleHistoryTitlesV331.subtitle( { propDisplayName } );
						}
						return defaultHistoryTitlesV331.subtitle( { provider, styleId, elementId, propDisplayName } );
					}
					return historyTitlesV330.subtitle;
				},
			}
		);
	}, [ elementId, meta ] );
}

function getCurrentProps( style: StyleDefinition | null, meta: StyleDefinitionVariant[ 'meta' ] ) {
	if ( ! style ) {
		return {};
	}

	const variant = getVariantByMeta( style, meta );

	const props = variant?.props ?? {};

	return structuredClone( props );
}

const historyTitlesV330 = {
	title: ( { elementId }: { elementId: ElementID } ) => getElementLabel( elementId ),
	subtitle: __( 'Style edited', 'elementor' ),
};

type DefaultHistoryTitleV331Args = {
	provider: StylesProvider;
};

type DefaultHistorySubtitleV331Args = {
	provider: StylesProvider;
	styleId: StyleDefinition[ 'id' ];
	elementId: ElementID;
	propDisplayName: string;
};

const defaultHistoryTitlesV331 = {
	title: ( { provider }: DefaultHistoryTitleV331Args ) => {
		const providerLabel = provider.labels?.singular;
		return providerLabel ? capitalize( providerLabel ) : __( 'Style', 'elementor' );
	},
	subtitle: ( { provider, styleId, elementId, propDisplayName }: DefaultHistorySubtitleV331Args ) => {
		const styleLabel = provider.actions.get( styleId, { elementId } )?.label;

		if ( ! styleLabel ) {
			throw new Error( `Style ${ styleId } not found` );
		}

		// translators: %s$1 is the style label, %s$2 is the name of the style property being edited
		return __( `%s$1 %s$2 edited`, 'elementor' ).replace( '%s$1', styleLabel ).replace( '%s$2', propDisplayName );
	},
};

type LocalStyleHistoryTitleV331Args = {
	elementId: ElementID;
};

type LocalStyleHistorySubtitleV331Args = {
	propDisplayName: string;
};

const localStyleHistoryTitlesV331 = {
	title: ( { elementId }: LocalStyleHistoryTitleV331Args ) => getElementLabel( elementId ),
	subtitle: ( { propDisplayName }: LocalStyleHistorySubtitleV331Args ) =>
		// translators: %s is the name of the style property being edited
		__( `%s edited`, 'elementor' ).replace( '%s', propDisplayName ),
};

function capitalize( str: string ) {
	return str.charAt( 0 ).toUpperCase() + str.slice( 1 );
}
