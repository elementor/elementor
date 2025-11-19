import { createTransformer } from '@elementor/editor-canvas';
import { __getState as getState } from '@elementor/store';

import { selectUnpublishedComponents } from './store/store';
import { ComponentInstancePropValue, type PublishedComponent, type UnpublishedComponent } from './types';
import { getComponentDocumentData } from './utils/component-document-data';

export const componentIdTransformer = createTransformer(
	async ( { component_id: id }: { component_id: number | string } ) => {
		const unpublishedComponents = selectUnpublishedComponents( getState() );

		const unpublishedComponent = unpublishedComponents.find( ( { uid } ) => uid === id );
		if ( unpublishedComponent ) {
			return structuredClone( unpublishedComponent.elements );
		}

		if ( typeof id !== 'number' ) {
			throw new Error( `Component ID "${ id }" not found.` );
		}

		const data = await getComponentDocumentData( id );

		return data?.elements ?? [];
	}
);
