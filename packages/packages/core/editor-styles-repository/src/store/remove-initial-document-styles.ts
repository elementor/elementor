import { __dispatch as dispatch } from '@elementor/store';

import { slice } from './initial-documents-styles-store';

type InitialDocumentId = number;

export function removeInitialDocumentStyles( id: InitialDocumentId ) {
	dispatch( slice.actions.remove( { id } ) );
}
