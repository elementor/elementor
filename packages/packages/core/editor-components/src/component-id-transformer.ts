import { createTransformer } from '@elementor/editor-canvas';
import { __getState as getState } from '@elementor/store';

import { selectUnpublishedComponents } from './store/store';
import { getComponentDocumentData } from './utils/component-document-data';

type PublishedComponentId = number;
type UnpublishedComponentId = string;

type ComponentId = PublishedComponentId | UnpublishedComponentId;

export const componentIdTransformer = createTransformer( async ( id: ComponentId ) => {
	const unpublishedComponents = selectUnpublishedComponents( getState() );

	const unpublishedComponent = unpublishedComponents.find( ( component ) => component.uid === id );
	if ( unpublishedComponent ) {
		return structuredClone( unpublishedComponent.elements );
	}

	if ( typeof id !== 'number' ) {
		throw new Error( `Component ID "${ id }" not found.` );
	}

	const data = await getComponentDocumentData( id );

	return data?.elements ?? [];
} );
