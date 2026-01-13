import { updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../api';
import { type ComponentInstanceProp } from '../prop-types/component-instance-prop-type';
import { selectUnpublishedComponents, slice } from '../store/store';
import { type DocumentSaveStatus, type UnpublishedComponent } from '../types';

export async function createComponentsBeforeSave( {
	elements,
	status,
}: {
	elements: V1ElementData[];
	status: DocumentSaveStatus;
} ) {
	const unpublishedComponents = selectUnpublishedComponents( getState() );

	if ( ! unpublishedComponents.length ) {
		return;
	}

	try {
		const uidToComponentId = await createComponents( unpublishedComponents, status );

		updateComponentInstances( elements, uidToComponentId );

		dispatch(
			slice.actions.add(
				unpublishedComponents.map( ( component ) => ( {
					id: uidToComponentId.get( component.uid ) as number,
					name: component.name,
					uid: component.uid,
					overridableProps: component.overridableProps ? component.overridableProps : undefined,
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
			settings: component.overridableProps ? { overridable_props: component.overridableProps } : undefined,
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
		const currentComponentId = ( element.settings?.component_instance as ComponentInstanceProp )?.value
			?.component_id.value;

		if ( currentComponentId && uidToComponentId.has( currentComponentId.toString() ) ) {
			return {
				shouldUpdate: true,
				newComponentId: uidToComponentId.get( currentComponentId.toString() ) as number,
			};
		}
	}
	return { shouldUpdate: false, newComponentId: null };
}

function updateElementComponentId( elementId: string, componentId: number ): void {
	updateElementSettings( {
		id: elementId,
		props: {
			component_instance: {
				$$type: 'component-instance',
				value: {
					component_id: { $$type: 'number', value: componentId },
				},
			},
		},
		withHistory: false,
	} );
}
