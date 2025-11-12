import { createTransformer } from '@elementor/editor-canvas';
import { __getState as getState } from '@elementor/store';

import { selectUnpublishedComponents } from './store/store';
import { getComponentDocumentData } from './utils/component-document-data';

export const componentIdTransformer = createTransformer( async ( id: number ) => {
	const unpublishedComponents = selectUnpublishedComponents( getState() );

	const unpublishedComponent = unpublishedComponents.find( ( component ) => component.id === id );

	if ( unpublishedComponent ) {
		return structuredClone( unpublishedComponent.elements );
	}

	const data = await getComponentDocumentData( id );

	return data?.elements ?? [];
} );
