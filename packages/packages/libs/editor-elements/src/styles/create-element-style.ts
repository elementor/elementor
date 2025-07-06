import { classesPropTypeUtil } from '@elementor/editor-props';
import {
	generateId,
	type StyleDefinition,
	type StyleDefinitionID,
	type StyleDefinitionVariant,
} from '@elementor/editor-styles';

import { getElementSetting } from '../sync/get-element-setting';
import { updateElementSettings } from '../sync/update-element-settings';
import { type ElementID } from '../types';
import { mutateElementStyles } from './mutate-element-styles';

export type CreateElementStyleArgs = {
	styleId?: StyleDefinitionID;
	elementId: ElementID;
	classesProp: string;
	label: string;
	meta: StyleDefinitionVariant[ 'meta' ];
	props: StyleDefinitionVariant[ 'props' ];
	additionalVariants?: StyleDefinitionVariant[];
};

export function createElementStyle( {
	styleId,
	elementId,
	classesProp,
	label,
	meta,
	props,
	additionalVariants = [],
}: CreateElementStyleArgs ): string {
	let id = styleId;

	mutateElementStyles( elementId, ( styles ) => {
		id ??= generateId( `e-${ elementId }-`, Object.keys( styles ) );

		const variants = [ { meta, props }, ...additionalVariants ];

		styles[ id ] = {
			id,
			label,
			type: 'class',
			variants,
		} satisfies StyleDefinition;

		addStyleToClassesProp( elementId, classesProp, id );

		return styles;
	} );

	return id as string;
}

function addStyleToClassesProp( elementId: ElementID, classesProp: string, styleId: string ) {
	const base = getElementSetting( elementId, classesProp );

	const classesPropValue = classesPropTypeUtil.create(
		( prev ) => {
			return [ ...( prev ?? [] ), styleId ];
		},
		{ base }
	);

	updateElementSettings( {
		id: elementId,
		props: {
			[ classesProp ]: classesPropValue,
		},
		withHistory: false,
	} );
}
