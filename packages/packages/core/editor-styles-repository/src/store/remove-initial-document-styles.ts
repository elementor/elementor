import { __dispatch as dispatch } from '@elementor/store';

import { invalidateCache } from './document-config';
import { slice } from './initial-documents-styles-store';

type InitialDocumentId = number;

export function removeInitialDocumentStyles( id: InitialDocumentId ) {
	invalidateCache( id );
	dispatch( slice.actions.remove( { id } ) );
}
