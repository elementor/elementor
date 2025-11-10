import { getContainer } from '../../sync/get-container';
import { getElementSettings } from '../../sync/get-element-setting';
import { getElementType } from '../../sync/get-element-type';

export function handleGetElementProps( elementId: string ): Record< string, unknown > {
	const container = getContainer( elementId );

	if ( ! container ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	const type = container.model.get( 'widgetType' ) || container.model.get( 'elType' );

	if ( ! type ) {
		throw new Error( `Element with ID "${ elementId }" has no type` );
	}

	const elementType = getElementType( type );

	if ( ! elementType ) {
		throw new Error( `Element type "${ type }" is not atomic` );
	}

	const propsSchema = elementType.propsSchema;
	const propKeys = Object.keys( propsSchema );

	return getElementSettings( elementId, propKeys );
}
