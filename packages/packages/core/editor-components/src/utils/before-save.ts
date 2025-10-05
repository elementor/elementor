import { updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { numberPropTypeUtil, type TransformablePropValue } from '@elementor/editor-props';
import { __getState as getState, __dispatch as dispatch } from '@elementor/store';

import { apiClient } from '../api';
import { selectUnpublishedComponents, slice } from '../store/store';

type Container = {
	model: {
		get: ( key: 'elements' ) => {
			toJSON: () => V1ElementData[];
		};
	};
};

type Status = 'draft' | 'autosave' | 'publish';

export const beforeSave = async ( { container, status }: { container: Container; status: Status } ) => {
	const unpublishedComponents = selectUnpublishedComponents( getState() );

	if ( ! unpublishedComponents.length ) {
		return;
	}

	try {
		const tempIdToComponentId = await apiClient.update( { unpublishedComponents, status } );

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
