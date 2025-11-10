import { updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { type TransformablePropValue } from '@elementor/editor-props';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../api';
import { selectUnpublishedComponents, slice } from '../store/store';
import { type DocumentStatus, type UnpublishedComponent } from '../types';

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
		const UUIDToComponentId = await createComponents( unpublishedComponents, status );

		const elements = container.model.get( 'elements' ).toJSON();
		updateComponentInstances( elements, UUIDToComponentId );

		dispatch(
			slice.actions.add(
				unpublishedComponents.map( ( component ) => ( {
					id: UUIDToComponentId.get( component.uuid ) as number,
					name: component.name,
					uuid: component.uuid,
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
): Promise< Map< string, number > > {
	const response = await apiClient.create( {
		status,
		items: components.map( ( component ) => ( {
			uuid: component.uuid,
			title: component.name,
			elements: component.elements,
		} ) ),
	} );

	const map = new Map< string, number >();

	Object.entries( response ).forEach( ( [ key, value ] ) => {
		map.set( key, value );
	} );

	return map;
}

function updateComponentInstances( elements: V1ElementData[], UUIDToComponentId: Map< string, number > ): void {
	elements.forEach( ( element ) => {
		const { shouldUpdate, newComponentId } = shouldUpdateElement( element, UUIDToComponentId );
		if ( shouldUpdate ) {
			updateElementComponentId( element.id, newComponentId );
		}

		if ( element.elements ) {
			updateComponentInstances( element.elements, UUIDToComponentId );
		}
	} );
}

function shouldUpdateElement(
	element: V1ElementData,
	UUIDToComponentId: Map< string, number >
): { shouldUpdate: true; newComponentId: number } | { shouldUpdate: false; newComponentId: null } {
	if ( element.widgetType === 'e-component' ) {
		const currentComponentId = ( element.settings?.component as TransformablePropValue< 'component-id', string > )
			?.value;
		if ( currentComponentId && UUIDToComponentId.has( currentComponentId ) ) {
			return { shouldUpdate: true, newComponentId: UUIDToComponentId.get( currentComponentId ) as number };
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
