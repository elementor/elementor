import { createTransformer, RenderContext } from '@elementor/editor-canvas';
import { __getState as getState } from '@elementor/store';

import { type ComponentInstanceOverrideProp } from './prop-types/component-instance-override-prop-type';
import { selectUnpublishedComponents } from './store/store';
import { getComponentDocumentData } from './utils/component-document-data';

type ComponentInstanceContext = {
	overrides?: Record< string, unknown >;
};

export const componentInstanceContext = new RenderContext< ComponentInstanceContext >( 'component-instance', {
	overrides: {},
} );

export const componentInstanceTransformer = createTransformer(
	async ( {
		component_id: id,
		overrides: overridesValue,
	}: {
		component_id: number | string;
		overrides?: ComponentInstanceOverrideProp[];
	} ) => {
		const unpublishedComponents = selectUnpublishedComponents( getState() );

		const unpublishedComponent = unpublishedComponents.find( ( { uid } ) => uid === id );

		const overrides = overridesValue?.reduce( ( acc, override ) => ( { ...acc, ...override } ), {} );

		if ( unpublishedComponent ) {
			return {
				elements: structuredClone( unpublishedComponent.elements ),
				overrides,
			};
		}

		if ( typeof id !== 'number' ) {
			throw new Error( `Component ID "${ id }" not valid.` );
		}

		const data = await getComponentDocumentData( id );

		return {
			elements: data?.elements ?? [],
			overrides,
		};
	}
);
