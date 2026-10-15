import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { getCurrentDocumentContainer } from './get-current-document-container';
import { getHostDocumentContainer } from './get-host-document-container';
import { type V1Element } from './types';

function collectElements( container: V1Element | null ): V1Element[] {
	if ( ! container ) {
		return [];
	}

	const children = [ ...( container.model.get( 'elements' ) ?? [] ) ].flatMap( ( childModel ) =>
		getElements( childModel.get( 'id' ) )
	);

	return [ container, ...children ];
}

export function getElements( root?: ElementID ): V1Element[] {
	const container = root ? getContainer( root ) : getCurrentDocumentContainer();

	return collectElements( container );
}

export function getHostDocumentElements(): V1Element[] {
	return collectElements( getHostDocumentContainer() );
}
