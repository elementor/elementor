import { type PropType } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';

import { getElementType } from '../../sync/get-element-type';
import type { ElementType } from '../../types';

export function handleGetElementSchema(
	elementType: string
): ElementType & { stylesSchema: Record< string, PropType > } {
	const elementTypeData = getElementType( elementType );

	if ( ! elementTypeData ) {
		throw new Error( `Element type "${ elementType }" not found or is not atomic` );
	}

	return { ...elementTypeData, stylesSchema: getStylesSchema() };
}
