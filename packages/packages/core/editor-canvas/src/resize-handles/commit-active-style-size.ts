import { useMemo } from 'react';
import {
	createElementStyle,
	deleteElementStyle,
	getElementLabel,
	shouldCreateNewLocalStyle,
} from '@elementor/editor-elements';
import { sizePropTypeUtil, type Props } from '@elementor/editor-props';
import { getVariantByMeta, type StyleDefinition, type StyleDefinitionVariant } from '@elementor/editor-styles';
import {
	ELEMENTS_STYLES_RESERVED_LABEL,
	isElementsStylesProvider,
	type StylesProvider,
} from '@elementor/editor-styles-repository';
import { undoable } from '@elementor/editor-v1-adapters';
import { setSessionStorageItem } from '@elementor/session';
import { __ } from '@wordpress/i18n';

import { type ActiveStyleTarget, getActiveStyleSessionLookup, getProviderForStyleId, resolveActiveStyleTarget } from './resolve-active-style-target';

export const HISTORY_DEBOUNCE_WAIT = 800;

export const MIN_RESIZE_SIZE_PX = 1;

export type SizeAxis = 'width' | 'height';

export function roundResizePixels( value: number ) {
	return Math.max( MIN_RESIZE_SIZE_PX, Math.round( value ) );
}

export function createSizePropFromPixels( size: number ) {
	return sizePropTypeUtil.create( { size: roundResizePixels( size ), unit: 'px' } );
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

export function buildStyleSizeCommitPayload( {
	elementId,
	props,
	propDisplayName,
}: {
	elementId: string;
	props: Props;
	propDisplayName: string;
} ): UndoableUpdateStylePayload | null {
	const target = resolveActiveStyleTarget( elementId );

	if ( ! target ) {
		return null;
	}

	let { styleId, provider } = target;

	if ( styleId && ! provider ) {
		provider = getProviderForStyleId( styleId, elementId );
	}

	if ( styleId && provider ) {
		return {
			styleId,
			provider,
			props,
			propDisplayName,
		};
	}

	return {
		styleId: null,
		provider: null,
		props,
		propDisplayName,
	};
}

export function createUndoableActiveStyleSizeCommit( {
	elementId,
	meta,
	classesProp,
}: {
	elementId: string;
	meta: StyleDefinitionVariant[ 'meta' ];
	classesProp: string;
} ) {
	const createStyleArgs = { elementId, classesProp, meta, label: ELEMENTS_STYLES_RESERVED_LABEL };

	return undoable(
		{
			do: ( payload: UndoableUpdateStylePayload ): UndoableUpdateStyleReturn => {
				if ( shouldCreateNewLocalStyle< StylesProvider >( payload ) ) {
					return createStyle( payload as CreateStyleArgs );
				}

				return updateStyle( payload as UpdateStyleArgs );
			},
			undo: ( payload: UndoableUpdateStylePayload, doReturn: UndoableUpdateStyleReturn ) => {
				if ( shouldCreateNewLocalStyle< StylesProvider >( payload ) ) {
					return undoCreateStyle( doReturn as CreateStyleReturn );
				}

				return undoUpdateStyle( payload as UpdateStyleArgs, doReturn as UpdateStyleReturn );
			},
			redo: ( payload: UndoableUpdateStylePayload, doReturn: UndoableUpdateStyleReturn ) => {
				if ( shouldCreateNewLocalStyle< StylesProvider >( payload ) ) {
					return createStyle( payload as CreateStyleArgs, doReturn as CreateStyleReturn );
				}

				return updateStyle( payload as UpdateStyleArgs );
			},
		},
		{
			title: ( { provider, styleId } ) => getHistoryTitle( { provider, styleId, elementId } ),
			subtitle: ( { propDisplayName } ) =>
				__( '%s edited', 'elementor' ).replace( '%s', propDisplayName ),
			debounce: { wait: HISTORY_DEBOUNCE_WAIT },
		}
	);

	function createStyle( { props }: CreateStyleArgs, redoArgs?: CreateStyleReturn ): CreateStyleReturn {
		const createdStyleId = createElementStyle( {
			...createStyleArgs,
			props,
			styleId: redoArgs?.createdStyleId,
		} );

		setSessionStorageItem( getActiveStyleSessionLookup( elementId ), createdStyleId );

		return { createdStyleId };
	}

	function undoCreateStyle( { createdStyleId }: CreateStyleReturn ) {
		deleteElementStyle( elementId, createdStyleId );
	}

	function updateStyle( { provider, styleId, props }: UpdateStyleArgs ): UpdateStyleReturn {
		if ( ! provider.actions.updateProps ) {
			throw new Error( `Provider ${ provider.getKey() } cannot update style props` );
		}

		const style = provider.actions.get( styleId, { elementId } );
		const prevProps = getCurrentProps( style, meta );

		provider.actions.updateProps( { id: styleId, meta, props }, { elementId } );

		return { styleId, provider, prevProps };
	}

	function undoUpdateStyle( { styleId, provider }: UpdateStyleArgs, { prevProps }: UpdateStyleReturn ) {
		provider.actions.updateProps?.( { id: styleId, meta, props: prevProps, mode: 'replace' }, { elementId } );
	}
}

export function useUndoableActiveStyleSizeCommit( {
	elementId,
	meta,
	target,
}: {
	elementId: string;
	meta: StyleDefinitionVariant[ 'meta' ];
	target: ActiveStyleTarget | null;
} ) {
	return useMemo( () => {
		if ( ! target ) {
			return null;
		}

		return createUndoableActiveStyleSizeCommit( {
			elementId,
			meta,
			classesProp: target.classesProp,
		} );
	}, [ elementId, meta, target ] );
}

function getCurrentProps( style: StyleDefinition | null, meta: StyleDefinitionVariant[ 'meta' ] ) {
	if ( ! style ) {
		return {};
	}

	const variant = getVariantByMeta( style, meta );

	return structuredClone( variant?.props ?? {} );
}

function getHistoryTitle( {
	provider,
	styleId,
	elementId,
}: {
	provider: StylesProvider | null;
	styleId: StyleDefinition[ 'id' ] | null;
	elementId: string;
} ) {
	const isLocal = ! provider || ! styleId || isElementsStylesProvider( provider.getKey() );

	if ( isLocal ) {
		return getElementLabel( elementId );
	}

	const providerLabel = provider.labels?.singular;

	return providerLabel ? providerLabel.charAt( 0 ).toUpperCase() + providerLabel.slice( 1 ) : __( 'Style', 'elementor' );
}
