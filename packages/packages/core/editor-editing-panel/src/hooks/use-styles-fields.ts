import { useMemo } from 'react';
import { createElementStyle, deleteElementStyle, type ElementID, getElementLabel } from '@elementor/editor-elements';
import type { Props } from '@elementor/editor-props';
import { getVariantByMeta, type StyleDefinition, type StyleDefinitionVariant } from '@elementor/editor-styles';
import { isElementsStylesProvider, type StylesProvider } from '@elementor/editor-styles-repository';
import { ELEMENTS_STYLES_RESERVED_LABEL } from '@elementor/editor-styles-repository';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { useClassesProp } from '../contexts/classes-prop-context';
import { useElement } from '../contexts/element-context';
import { useStyle } from '../contexts/style-context';
import { StyleNotFoundUnderProviderError, StylesProviderCannotUpdatePropsError } from '../errors';
import { useStylesRerender } from './use-styles-rerender';

const HISTORY_DEBOUNCE_WAIT = 800;

export function useStylesFields< T extends Props >( propNames: ( keyof T & string )[] ) {
	const {
		element: { id: elementId },
	} = useElement();
	const { id: styleId, meta, provider, canEdit } = useStyle();

	const undoableUpdateStyle = useUndoableUpdateStyle( { elementId, meta } );

	useStylesRerender();

	const values = getProps< T >( { elementId, styleId, provider, meta, propNames } );

	const setValues = ( props: T, { history: { propDisplayName } }: { history: { propDisplayName: string } } ) => {
		if ( ! styleId ) {
			undoableUpdateStyle( { styleId: null, provider: null, props, propDisplayName } );
		} else {
			undoableUpdateStyle( { styleId, provider, props, propDisplayName } );
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

type UpdateStyleArgs = {
	styleId: StyleDefinition[ 'id' ];
	provider: StylesProvider;
	props: Props;
	propDisplayName: string;
};

type CreateStyleArgs = {
	styleId: null;
	provider: null;
	props: Props;
	propDisplayName: string;
};

type UpdateStyleReturn = {
	styleId: StyleDefinition[ 'id' ];
	provider: StylesProvider;
	prevProps: Props;
};

type CreateStyleReturn = {
	createdStyleId: StyleDefinition[ 'id' ];
};

type UndoableUpdateStylePayload = UpdateStyleArgs | CreateStyleArgs;
type UndoableUpdateStyleReturn = UpdateStyleReturn | CreateStyleReturn;

function useUndoableUpdateStyle( {
	elementId,
	meta: { breakpoint, state },
}: {
	elementId: ElementID;
	meta: StyleDefinitionVariant[ 'meta' ];
} ) {
	const classesProp = useClassesProp();

	return useMemo( () => {
		const meta = { breakpoint, state };

		const createStyleArgs = { elementId, classesProp, meta, label: ELEMENTS_STYLES_RESERVED_LABEL };

		return undoable(
			{
				do: ( payload: UndoableUpdateStylePayload ): UndoableUpdateStyleReturn => {
					if ( shouldCreateNewLocalStyle( payload ) ) {
						return createLocalStyle( payload as CreateStyleArgs );
					}
					return updateStyleProps( payload as UpdateStyleArgs );
				},
				undo: ( payload: UndoableUpdateStylePayload, doReturn: UndoableUpdateStyleReturn ) => {
					const wasLocalStyleCreated = shouldCreateNewLocalStyle( payload );

					if ( wasLocalStyleCreated ) {
						return undoCreateLocalStyle( payload as CreateStyleArgs, doReturn as CreateStyleReturn );
					}
					return undoUpdateStyleProps( payload as UpdateStyleArgs, doReturn as UpdateStyleReturn );
				},
				redo: ( payload: UndoableUpdateStylePayload, doReturn: UndoableUpdateStyleReturn ) => {
					const wasLocalStyleCreated = shouldCreateNewLocalStyle( payload );

					if ( wasLocalStyleCreated ) {
						return createLocalStyle( payload as CreateStyleArgs, doReturn as CreateStyleReturn );
					}
					return updateStyleProps( payload as UpdateStyleArgs );
				},
			},
			{
				title: ( { provider, styleId } ) => {
					let title: string;

					const isLocal = isLocalStyle( provider, styleId );

					if ( isLocal ) {
						title = localStyleHistoryTitlesV331.title( { elementId } );
					} else {
						// If the provider was nullish, `isLocalStyle` would return true.
						provider = provider as StylesProvider;

						title = defaultHistoryTitlesV331.title( { provider } );
					}

					return title;
				},
				subtitle: ( { provider, styleId, propDisplayName } ) => {
					let subtitle: string;

					const isLocal = isLocalStyle( provider, styleId );

					if ( isLocal ) {
						subtitle = localStyleHistoryTitlesV331.subtitle( { propDisplayName } );
					} else {
						// If the provider or styleId were nullish, `isLocalStyle` would return true.
						provider = provider as StylesProvider;
						styleId = styleId as StyleDefinition[ 'id' ];

						subtitle = defaultHistoryTitlesV331.subtitle( {
							provider,
							styleId,
							elementId,
							propDisplayName,
						} );
					}
					return subtitle;
				},
				debounce: { wait: HISTORY_DEBOUNCE_WAIT },
			}
		);

		function shouldCreateNewLocalStyle( payload: UndoableUpdateStylePayload ) {
			// If styleId and provider are nullish, it means that it's a local style that haven't been created yet.
			// Local styles are created only when the user starts editing a style.
			return ! payload.styleId && ! payload.provider;
		}

		function createLocalStyle( { props }: CreateStyleArgs, redoArgs?: CreateStyleReturn ): CreateStyleReturn {
			const createdStyle = createElementStyle( { ...createStyleArgs, props, styleId: redoArgs?.createdStyleId } );

			return { createdStyleId: createdStyle };
		}

		function undoCreateLocalStyle( _: UndoableUpdateStylePayload, { createdStyleId }: CreateStyleReturn ) {
			deleteElementStyle( elementId, createdStyleId );
		}

		function updateStyleProps( { provider, styleId, props }: UpdateStyleArgs ): UpdateStyleReturn {
			if ( ! provider.actions.updateProps ) {
				throw new StylesProviderCannotUpdatePropsError( {
					context: { providerKey: provider.getKey() },
				} );
			}

			const style = provider.actions.get( styleId, { elementId } );
			const prevProps = getCurrentProps( style, meta );

			provider.actions.updateProps( { id: styleId, meta, props }, { elementId } );

			return { styleId, provider, prevProps };
		}

		function undoUpdateStyleProps(
			_: UndoableUpdateStylePayload,
			{ styleId, provider, prevProps }: UpdateStyleReturn
		) {
			provider.actions.updateProps?.( { id: styleId, meta, props: prevProps }, { elementId } );
		}
	}, [ elementId, breakpoint, state, classesProp ] );
}

function getCurrentProps( style: StyleDefinition | null, meta: StyleDefinitionVariant[ 'meta' ] ) {
	if ( ! style ) {
		return {};
	}

	const variant = getVariantByMeta( style, meta );

	const props = variant?.props ?? {};

	return structuredClone( props );
}

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

const isLocalStyle = ( provider: StylesProvider | null, styleId: StyleDefinition[ 'id' ] | null ) =>
	! provider || ! styleId || isElementsStylesProvider( provider.getKey() );
