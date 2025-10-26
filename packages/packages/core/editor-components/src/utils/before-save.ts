import { updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { type TransformablePropValue } from '@elementor/editor-props';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../api';
import { selectUnpublishedComponents, slice, type UnpublishedComponent } from '../store/store';
import { type DocumentStatus } from '../types';

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
		const tempIdToComponentId = await createComponents( unpublishedComponents, status );

		const elements = container.model.get( 'elements' ).toJSON();
		updateComponentInstances( elements, tempIdToComponentId );

		dispatch(
			slice.actions.add(
				unpublishedComponents.map( ( component ) => ( {
					id: tempIdToComponentId.get( component.id ) as number,
					name: component.name,
				} ) )
			)
		);
		dispatch( slice.actions.resetUnpublished() );
	} catch ( error ) {
		throw new Error( `Failed to publish components and update component instances: ${ error }` );
	}
};

async function createComponents(
	components: UnpublishedComponent[],
	status: DocumentStatus
): Promise< Map< number, number > > {
	const response = await apiClient.create( {
		status,
		items: components.map( ( component ) => ( {
			temp_id: component.id,
			title: component.name,
			elements: component.elements,
		} ) ),
	} );

	const map = new Map< number, number >();

	Object.entries( response ).forEach( ( [ key, value ] ) => {
		map.set( Number( key ), value );
	} );

	return map;
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
		const currentComponentId = ( element.settings?.component as TransformablePropValue< 'component-id', number > )
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
			component: {
				$$type: 'component-id',
				value: componentId,
			},
		},
		withHistory: false,
	} );
}
