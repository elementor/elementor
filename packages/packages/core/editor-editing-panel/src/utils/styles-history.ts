import {
	createElementStyle,
	deleteElementStyle,
	type ElementID,
	getElementLabel,
	shouldCreateNewLocalStyle,
} from '@elementor/editor-elements';
import type { Props } from '@elementor/editor-props';
import { getVariantByMeta, type StyleDefinition, type StyleDefinitionVariant } from '@elementor/editor-styles';
import { isElementsStylesProvider, type StylesProvider } from '@elementor/editor-styles-repository';
import { ELEMENTS_STYLES_RESERVED_LABEL } from '@elementor/editor-styles-repository';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { StylesProviderCannotUpdatePropsError } from '../errors';
import { getElementClassesProp, getElementLocalStyle } from './element-local-style';

export type StyleTarget = {
	elementId: ElementID;
	classesProp: string;
	styleId: StyleDefinition[ 'id' ] | null;
	provider: StylesProvider | null;
};

export type StyleWrite = {
	target: StyleTarget;
	meta: StyleDefinitionVariant[ 'meta' ];
	props: Props;
};

export type UpdateStylesPayload = {
	writes: StyleWrite[];
	propDisplayName: string;
};

type UpdateStyleTarget = StyleTarget & {
	styleId: StyleDefinition[ 'id' ];
	provider: StylesProvider;
};

type UpdateStyleReturn = {
	styleId: StyleDefinition[ 'id' ];
	provider: StylesProvider;
	prevProps: Props;
};

type CreateStyleReturn = {
	createdStyleId: StyleDefinition[ 'id' ];
};

type WriteReturn = UpdateStyleReturn | CreateStyleReturn;

type UndoableUpdateStylesOptions = {
	debounceWait?: number;
};

export function getLocalStyleTargets( elementIds: ElementID[] ): StyleTarget[] {
	return elementIds.flatMap( ( elementId ) => {
		const classesProp = getElementClassesProp( elementId );

		if ( ! classesProp ) {
			return [];
		}

		const localStyle = getElementLocalStyle( elementId );

		return [
			{
				elementId,
				classesProp,
				styleId: localStyle?.styleId ?? null,
				provider: localStyle?.provider ?? null,
			},
		];
	} );
}

export function createUndoableUpdateStyles( { debounceWait }: UndoableUpdateStylesOptions = {} ) {
	return undoable(
		{
			do: ( { writes }: UpdateStylesPayload ): WriteReturn[] => applyWrites( writes ),
			undo: ( { writes }: UpdateStylesPayload, doReturn: WriteReturn[] ) => {
				writes
					.map( ( write, index ) => ( { write, result: doReturn[ index ] } ) )
					.reverse()
					.forEach( ( { write, result } ) => revertWrite( write, result ) );
			},
			redo: ( { writes }: UpdateStylesPayload, doReturn: WriteReturn[] ): WriteReturn[] =>
				applyWrites( writes, doReturn ),
		},
		{
			title: ( { writes: [ { target } ] } ) => getTitle( target ),
			subtitle: ( { writes: [ { target } ], propDisplayName } ) => getSubtitle( { ...target, propDisplayName } ),
			debounce: debounceWait ? { wait: debounceWait } : undefined,
		}
	);
}

function applyWrites( writes: StyleWrite[], redoReturns?: WriteReturn[] ): WriteReturn[] {
	const createdStyles = new Map< ElementID, UpdateStyleTarget >();

	return writes.map( ( { target, meta, props }, index ) => {
		const resolvedTarget = createdStyles.get( target.elementId ) ?? target;

		if ( ! shouldCreateNewLocalStyle< StylesProvider >( resolvedTarget ) ) {
			return update( resolvedTarget as UpdateStyleTarget, meta, props );
		}

		const result = create( resolvedTarget, meta, props, redoReturns?.[ index ] as CreateStyleReturn | undefined );
		const createdStyle = getElementLocalStyle( target.elementId );

		if ( createdStyle ) {
			createdStyles.set( target.elementId, { ...target, ...createdStyle } );
		}

		return result;
	} );
}

function revertWrite( { target, meta }: StyleWrite, result: WriteReturn ) {
	if ( 'createdStyleId' in result ) {
		deleteElementStyle( target.elementId, result.createdStyleId );

		return;
	}

	result.provider.actions.updateProps?.(
		{ id: result.styleId, meta, props: result.prevProps, mode: 'replace' },
		{ elementId: target.elementId }
	);
}

function create(
	{ elementId, classesProp }: StyleTarget,
	meta: StyleDefinitionVariant[ 'meta' ],
	props: Props,
	redoArgs?: CreateStyleReturn
): CreateStyleReturn {
	const createdStyleId = createElementStyle( {
		elementId,
		classesProp,
		meta,
		label: ELEMENTS_STYLES_RESERVED_LABEL,
		props,
		styleId: redoArgs?.createdStyleId,
	} );

	return { createdStyleId };
}

function update(
	{ elementId, provider, styleId }: UpdateStyleTarget,
	meta: StyleDefinitionVariant[ 'meta' ],
	props: Props
): UpdateStyleReturn {
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

function getCurrentProps( style: StyleDefinition | null, meta: StyleDefinitionVariant[ 'meta' ] ) {
	if ( ! style ) {
		return {};
	}

	const variant = getVariantByMeta( style, meta );

	const props = variant?.props ?? {};

	return structuredClone( props );
}

type DefaultHistoryTitleArgs = {
	provider: StylesProvider;
};

type DefaultHistorySubtitleArgs = {
	provider: StylesProvider;
	styleId: StyleDefinition[ 'id' ];
	elementId: ElementID;
	propDisplayName: string;
};

const defaultHistoryTitles = {
	title: ( { provider }: DefaultHistoryTitleArgs ) => {
		const providerLabel = provider.labels?.singular;
		return providerLabel ? capitalize( providerLabel ) : __( 'Style', 'elementor' );
	},
	subtitle: ( { provider, styleId, elementId, propDisplayName }: DefaultHistorySubtitleArgs ) => {
		const styleLabel = provider.actions.get( styleId, { elementId } )?.label;

		if ( ! styleLabel ) {
			throw new Error( `Style ${ styleId } not found` );
		}

		// translators: %s$1 is the style label, %s$2 is the name of the style property being edited
		return __( `%s$1 %s$2 edited`, 'elementor' ).replace( '%s$1', styleLabel ).replace( '%s$2', propDisplayName );
	},
};

type LocalStyleHistoryTitleArgs = {
	elementId: ElementID;
};

type LocalStyleHistorySubtitleArgs = {
	propDisplayName: string;
};

const localStyleHistoryTitles = {
	title: ( { elementId }: LocalStyleHistoryTitleArgs ) => getElementLabel( elementId ),
	subtitle: ( { propDisplayName }: LocalStyleHistorySubtitleArgs ) =>
		// translators: %s is the name of the style property being edited
		__( `%s edited`, 'elementor' ).replace( '%s', propDisplayName ),
};

function capitalize( str: string ) {
	return str.charAt( 0 ).toUpperCase() + str.slice( 1 );
}

const isLocalStyle = ( provider: StylesProvider | null, styleId: StyleDefinition[ 'id' ] | null ) =>
	! provider || ! styleId || isElementsStylesProvider( provider.getKey() );

type TitleOptions = {
	provider: StylesProvider | null;
	styleId: string | null;
	elementId: string;
};

type SubtitleOptions = TitleOptions & { propDisplayName: string };

export const getTitle = ( { provider, styleId, elementId }: TitleOptions ) => {
	const isLocal = isLocalStyle( provider, styleId );

	if ( isLocal ) {
		return localStyleHistoryTitles.title( { elementId } );
	}

	return defaultHistoryTitles.title( { provider: provider as StylesProvider } );
};

export const getSubtitle = ( { provider, styleId, propDisplayName, elementId }: SubtitleOptions ) => {
	const isLocal = isLocalStyle( provider, styleId );

	if ( isLocal ) {
		return localStyleHistoryTitles.subtitle( { propDisplayName } );
	}

	return defaultHistoryTitles.subtitle( {
		provider: provider as StylesProvider,
		styleId: styleId as StyleDefinition[ 'id' ],
		elementId,
		propDisplayName,
	} );
};
