import { updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { type TransformablePropValue } from '@elementor/editor-props';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../api';
import { selectUnpublishedComponents, slice } from '../store/store';
import { type Container, type DocumentSaveStatus, type UnpublishedComponent } from '../types';

export async function createComponentsBeforeSave( {
	container,
	status,
}: {
	container: Container;
	status: DocumentSaveStatus;
} ) {
	const unpublishedComponents = selectUnpublishedComponents( getState() );

	if ( ! unpublishedComponents.length ) {
		return;
	}

	try {
		const uidToComponentId = await createComponents( unpublishedComponents, status );

		const elements = container.model.get( 'elements' ).toJSON();
		updateComponentInstances( elements, uidToComponentId );

		dispatch(
			slice.actions.add(
				unpublishedComponents.map( ( component ) => ( {
					id: uidToComponentId.get( component.uid ) as number,
					name: component.name,
					uid: component.uid,
				} ) )
			)
		);
		dispatch( slice.actions.resetUnpublished() );
	} catch ( error ) {
		throw new Error( `Failed to publish components and update component instances: ${ error }` );
	}
}

async function createComponents(
	components: UnpublishedComponent[],
	status: DocumentSaveStatus
): Promise< Map< string, number > > {
	const response = await apiClient.create( {
		status,
		items: components.map( ( component ) => ( {
			uid: component.uid,
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

function updateComponentInstances( elements: V1ElementData[], uidToComponentId: Map< string, number > ): void {
	elements.forEach( ( element ) => {
		const { shouldUpdate, newComponentId } = shouldUpdateElement( element, uidToComponentId );
		if ( shouldUpdate ) {
			updateElementComponentId( element.id, newComponentId );
		}

		if ( element.elements ) {
			updateComponentInstances( element.elements, uidToComponentId );
		}
	} );
}

function shouldUpdateElement(
	element: V1ElementData,
	uidToComponentId: Map< string, number >
): { shouldUpdate: true; newComponentId: number } | { shouldUpdate: false; newComponentId: null } {
	if ( element.widgetType === 'e-component' ) {
		const currentComponentId = ( element.settings?.component as TransformablePropValue< 'component-id', string > )
			?.value;
		if ( currentComponentId && uidToComponentId.has( currentComponentId ) ) {
			return { shouldUpdate: true, newComponentId: uidToComponentId.get( currentComponentId ) as number };
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
