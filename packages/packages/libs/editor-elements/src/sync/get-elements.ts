import { type ElementID } from '../types';
import { getContainer } from './get-container';
import getCurrentDocumentContainer from './get-current-document-container';
import { type V1Element } from './types';

export function getElements( root?: ElementID ): V1Element[] {
	const container = root ? getContainer( root ) : getCurrentDocumentContainer();

	if ( ! container ) {
		return [];
	}

	const children = [ ...( container.model.get( 'elements' ) ?? [] ) ].flatMap( ( childModel ) =>
		getElements( childModel.get( 'id' ) )
	);

	return [ container, ...children ];
}
