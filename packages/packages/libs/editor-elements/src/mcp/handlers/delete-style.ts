import { deleteElementStyle } from '../../styles/delete-element-style';
import { getElementStyles } from '../../sync/get-element-styles';

export function handleDeleteStyle( { elementId, styleId }: { elementId: string; styleId?: string } ): {
	success: boolean;
} {
	const elementStyles = getElementStyles( elementId );

	if ( ! elementStyles ) {
		throw new Error( `Element with ID "${ elementId }" has no styles.` );
	}

	const resolvedStyleId = styleId || Object.keys( elementStyles )[ 0 ];

	if ( ! resolvedStyleId ) {
		throw new Error( `Element with ID "${ elementId }" has no styles to delete.` );
	}

	deleteElementStyle( elementId, resolvedStyleId );

	return { success: true };
}
