import {
	createElementStyle,
	deleteElementStyle,
	getElementStyles,
	updateElementStyle,
	type V1Element,
} from '@elementor/editor-elements';
import { type StyleDefinition, type StyleDefinitionVariant } from '@elementor/editor-styles';
import { ELEMENTS_STYLES_RESERVED_LABEL } from '@elementor/editor-styles-repository';
import { undoable } from '@elementor/editor-v1-adapters';

import { getClassesProp, getTitleForContainers } from '../../utils/command-utils';

type EntryVariant = Omit< StyleDefinitionVariant, 'custom_css' > &
	Partial< Pick< StyleDefinitionVariant, 'custom_css' > >;

export type ElementStylesEntry = {
	container: V1Element;
	variants: EntryVariant[];
};

export type ApplyElementStylesArgs = {
	entries: ElementStylesEntry[];
	subtitle: string;
};

type RevertData = {
	styleId: StyleDefinition[ 'id' ];
	originalStyle: StyleDefinition | null;
} | null;

export const undoableApplyElementStyles = () =>
	undoable(
		{
			do: ( { entries }: ApplyElementStylesArgs ): RevertData[] =>
				entries.map( ( { container, variants } ) => applyVariants( container, variants ) ),

			undo: ( { entries }: ApplyElementStylesArgs, revertDataItems: RevertData[] ) => {
				entries.forEach( ( { container }, index ) => revert( container, revertDataItems[ index ] ) );
			},
		},
		{
			title: ( { entries } ) => getTitleForContainers( entries.map( ( { container } ) => container ) ),
			subtitle: ( { subtitle } ) => subtitle,
		}
	);

function applyVariants( container: V1Element, variants: EntryVariant[] ): RevertData {
	const elementId = container.id;
	const classesProp = getClassesProp( container );

	if ( ! classesProp || ! variants.length ) {
		return null;
	}

	const originalStyles = getElementStyles( container.id );

	const [ styleId, styleDef ] = Object.entries( originalStyles ?? {} )[ 0 ] ?? []; // we currently support only one local style
	const originalStyle = Object.keys( styleDef ?? {} ).length ? styleDef : null;

	if ( styleId ) {
		variants.forEach( ( variant ) => updateElementStyle( { elementId, styleId, ...variant } ) );

		return { styleId, originalStyle };
	}

	const [ firstVariant, ...additionalVariants ] = variants.map( ( variant ) => ( {
		...variant,
		custom_css: variant.custom_css ?? null,
	} ) );

	return {
		styleId: createElementStyle( {
			elementId,
			classesProp,
			label: ELEMENTS_STYLES_RESERVED_LABEL,
			...firstVariant,
			additionalVariants,
		} ),
		originalStyle,
	};
}

function revert( container: V1Element, revertData: RevertData ) {
	if ( ! revertData ) {
		return;
	}

	if ( ! revertData.originalStyle ) {
		deleteElementStyle( container.id, revertData.styleId );

		return;
	}

	const classesProp = getClassesProp( container );

	if ( ! classesProp ) {
		return;
	}

	const [ firstVariant ] = revertData.originalStyle.variants;
	const additionalVariants = revertData.originalStyle.variants.slice( 1 );

	createElementStyle( {
		elementId: container.id,
		classesProp,
		label: ELEMENTS_STYLES_RESERVED_LABEL,
		styleId: revertData.styleId,
		...firstVariant,
		additionalVariants,
	} );
}
