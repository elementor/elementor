import { HISTORY_DEBOUNCE_WAIT } from '@elementor/editor-editing-panel';
import {
	createElementStyle,
	deleteElementStyle,
	type ElementID,
	getContainer,
	getElementLabel,
	getElementStyles,
	getElementType,
	updateElementStyle,
} from '@elementor/editor-elements';
import { CLASSES_PROP_KEY, type Props } from '@elementor/editor-props';
import { getVariantByMeta, type StyleDefinitionID, type StyleDefinitionVariant } from '@elementor/editor-styles';
import { ELEMENTS_STYLES_RESERVED_LABEL } from '@elementor/editor-styles-repository';
import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

export type UpdateLocalStylesPayload = {
	rootId: ElementID;
	elementIds: ElementID[];
	meta: StyleDefinitionVariant[ 'meta' ];
	props: Props;
	propDisplayName: string;
};

type CreatedLocalStyle = {
	elementId: ElementID;
	createdStyleId: StyleDefinitionID;
};

type UpdatedLocalStyle = {
	elementId: ElementID;
	styleId: StyleDefinitionID;
	prevProps: Props;
};

type LocalStyleWrite = CreatedLocalStyle | UpdatedLocalStyle;

export const updateLocalStyles = undoable(
	{
		do: ( payload: UpdateLocalStylesPayload ): LocalStyleWrite[] => writeLocalStyles( payload ),
		undo: ( { meta }: UpdateLocalStylesPayload, writes: LocalStyleWrite[] ) => {
			writes.forEach( ( write ) => revertLocalStyle( write, meta ) );
		},
		redo: ( payload: UpdateLocalStylesPayload, writes: LocalStyleWrite[] ): LocalStyleWrite[] =>
			writeLocalStyles( payload, writes ),
	},
	{
		title: ( { rootId } ) => getElementLabel( rootId ),
		subtitle: ( { propDisplayName } ) =>
			// translators: %s is the name of the style property being edited
			__( '%s edited', 'elementor' ).replace( '%s', propDisplayName ),
		debounce: { wait: HISTORY_DEBOUNCE_WAIT },
	}
);

function writeLocalStyles(
	{ elementIds, meta, props }: UpdateLocalStylesPayload,
	previousWrites: LocalStyleWrite[] = []
): LocalStyleWrite[] {
	return elementIds.flatMap( ( elementId ) => {
		const previousWrite = previousWrites.find( ( write ) => write.elementId === elementId );
		const recreatedStyleId =
			previousWrite && 'createdStyleId' in previousWrite ? previousWrite.createdStyleId : undefined;
		const write = writeLocalStyle( { elementId, meta, props, recreatedStyleId } );

		return write ? [ write ] : [];
	} );
}

type WriteLocalStyleArgs = {
	elementId: ElementID;
	meta: StyleDefinitionVariant[ 'meta' ];
	props: Props;
	recreatedStyleId?: StyleDefinitionID;
};

function writeLocalStyle( { elementId, meta, props, recreatedStyleId }: WriteLocalStyleArgs ): LocalStyleWrite | null {
	const styleId = getLocalStyleId( elementId );

	if ( styleId ) {
		const prevProps = getCurrentValues( { elementId, styleId, meta, keys: Object.keys( props ) } );

		updateElementStyle( { elementId, styleId, meta, props } );

		return { elementId, styleId, prevProps };
	}

	const classesProp = getClassesProp( elementId );

	if ( ! classesProp ) {
		return null;
	}

	const createdStyleId = createElementStyle( {
		styleId: recreatedStyleId,
		elementId,
		classesProp,
		label: ELEMENTS_STYLES_RESERVED_LABEL,
		meta,
		props,
	} );

	return { elementId, createdStyleId };
}

function revertLocalStyle( write: LocalStyleWrite, meta: StyleDefinitionVariant[ 'meta' ] ) {
	if ( 'createdStyleId' in write ) {
		deleteElementStyle( write.elementId, write.createdStyleId );

		return;
	}

	updateElementStyle( { elementId: write.elementId, styleId: write.styleId, meta, props: write.prevProps } );
}

export function getLocalStyleId( elementId: ElementID ): StyleDefinitionID | null {
	return Object.keys( getElementStyles( elementId ) ?? {} )[ 0 ] ?? null;
}

type GetCurrentValuesArgs = {
	elementId: ElementID;
	styleId: StyleDefinitionID;
	meta: StyleDefinitionVariant[ 'meta' ];
	keys: string[];
};

function getCurrentValues( { elementId, styleId, meta, keys }: GetCurrentValuesArgs ): Props {
	const style = getElementStyles( elementId )?.[ styleId ];
	const variant = style ? getVariantByMeta( style, meta ) : null;

	return Object.fromEntries( keys.map( ( key ) => [ key, structuredClone( variant?.props[ key ] ?? null ) ] ) );
}

export function getClassesProp( elementId: ElementID ): string | null {
	const container = getContainer( elementId );
	const type = container?.model.get( 'widgetType' ) || container?.model.get( 'elType' );
	const propsSchema = type ? getElementType( type )?.propsSchema : null;

	const classesEntry = Object.entries( propsSchema ?? {} ).find(
		( [ , propType ] ) => propType.kind === 'plain' && propType.key === CLASSES_PROP_KEY
	);

	return classesEntry?.[ 0 ] ?? null;
}
