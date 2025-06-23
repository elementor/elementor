import { ElementLabelNotExistsError, ElementTypeNotExistsError } from '../errors';
import { getContainer } from '../sync/get-container';
import { getWidgetsCache } from '../sync/get-widgets-cache';
import { type ElementID } from '../types';

export function getElementLabel( elementId: ElementID ) {
	const container = getContainer( elementId );

	const type = container?.model.get( 'widgetType' ) || container?.model.get( 'elType' );

	if ( ! type ) {
		throw new ElementTypeNotExistsError( { context: { elementId } } );
	}

	const label = getWidgetsCache()?.[ type ]?.title;

	if ( ! label ) {
		throw new ElementLabelNotExistsError( { context: { elementType: type } } );
	}

	return label;
}
