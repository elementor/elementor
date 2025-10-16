import { updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { numberPropTypeUtil, type TransformablePropValue } from '@elementor/editor-props';
import { __getState as getState, __dispatch as dispatch } from '@elementor/store';

import { apiClient } from '../api';
import { selectUnpublishedComponents, slice, UnpublishedComponent } from '../store/store';
import { DocumentStatus } from '../types';

type Container = {
	model: {
		get: ( key: 'elements' ) => {
			toJSON: () => V1ElementData[];
		};
	};
};

export const beforeSave = async ( { container, status }: { container: Container; status: DocumentStatus } ) => {
	const unpublishedComponents = selectUnpublishedComponents( getState() );

	if ( ! unpublishedComponents.length ) {
		return;
	}

	try {
		const tempIdToComponentId = await createComponents( unpublishedComponents, status  );

		const elements = container.model.get( 'elements' ).toJSON();
		updateComponentInstances( elements, tempIdToComponentId );

		dispatch( slice.actions.add( unpublishedComponents.map( ( component ) => ( {
			id: tempIdToComponentId.get( component.id ) as number,
			name: component.name,
		} ) ) ) );
		dispatch( slice.actions.resetUnpublished() );
	} catch ( error ) {
		throw new Error( `Failed to publish components and update component instances: ${ error }` );
	}
};

async function createComponents( components: UnpublishedComponent[], status: DocumentStatus ): Promise< Map< number, number > > {
	const tempIdToComponentId = new Map< number, number >();

	const promises = components.map( ( component ) => {
		return apiClient.create( { name: component.name, content: component.content, status } ).then(
			( response ) => {
				tempIdToComponentId.set( component.id, response.component_id );
			}
		);
	} );
	
	await Promise.all( promises );

	return tempIdToComponentId;
}

function updateComponentInstances( elements: V1ElementData[], tempIdToComponentId: Map< number, number > ): void {
	elements.forEach( ( element ) => {
		const { shouldUpdate, newComponentId } = shouldUpdateElement( element, tempIdToComponentId );
		if ( shouldUpdate ) {
			updateElementComponentId( element.id, newComponentId );
		}

		if ( element.elements ) {
			updateComponentInstances( element.elements, tempIdToComponentId );
		}
	} );
}

function shouldUpdateElement(
	element: V1ElementData,
	tempIdToComponentId: Map< number, number >
): { shouldUpdate: true; newComponentId: number } | { shouldUpdate: false; newComponentId: null } {
	if ( element.widgetType === 'e-component' ) {
		const currentComponentId = ( element.settings?.component_id as TransformablePropValue< 'number', number > )
			?.value;
		if ( currentComponentId && tempIdToComponentId.has( currentComponentId ) ) {
			return { shouldUpdate: true, newComponentId: tempIdToComponentId.get( currentComponentId ) as number };
		}
	}
	return { shouldUpdate: false, newComponentId: null };
}

function updateElementComponentId( elementId: string, componentId: number ): void {
	updateElementSettings( {
		id: elementId,
		props: {
			component_id: numberPropTypeUtil.create( componentId ),
		},
		withHistory: false,
	} );
}
