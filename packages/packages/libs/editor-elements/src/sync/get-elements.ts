import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { getCurrentDocumentContainer } from './get-current-document-container';
import { findModel } from './get-model';
import { type V1Element } from './types';

export function getElements( root?: ElementID ): V1Element[] {
	const container = root ? getContainerOrVirtual( root ) : getCurrentDocumentContainer();

	if ( ! container ) {
		return [];
	}

	const children = [ ...( container.model.get( 'elements' ) ?? [] ) ].flatMap( ( childModel ) =>
		getElements( childModel.get( 'id' ) )
	);

	return [ container, ...children ];
}

function getContainerOrVirtual( id: ElementID ): V1Element | null {
	const container = getContainer( id );

	if ( container ) {
		return container;
	}

	const result = findModel( id );

	if ( ! result ) {
		return null;
	}

	return { model: result.model } as V1Element;
}
