import { type NotificationData, notify } from '@elementor/editor-notifications';
import { updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type CreatedResult } from '../api';
import { type ComponentInstanceProp } from '../prop-types/component-instance-prop-type';
import { selectUnpublishedComponents, slice } from '../store/store';

export function handleCreatedComponents( result: CreatedResult, elements: V1ElementData[] ): void {
	const uidToComponentId = new Map( Object.entries( result.success ).map( ( [ uid, id ] ) => [ uid, id ] ) );
	const unpublishedComponents = selectUnpublishedComponents( getState() );

	updateComponentInstances( elements, uidToComponentId );

	dispatch(
		slice.actions.add(
			unpublishedComponents
				.filter( ( component ) => uidToComponentId.has( component.uid ) )
				.map( ( component ) => ( {
					id: uidToComponentId.get( component.uid ) as number,
					name: component.name,
					uid: component.uid,
					overridableProps: component.overridableProps ? component.overridableProps : undefined,
				} ) )
		)
	);
	dispatch( slice.actions.resetUnpublished() );

	if ( result.failed.length > 0 ) {
		const failedNames = result.failed.map( ( item ) => item.uid );
		const failedNotification: NotificationData = {
			type: 'error',
			message: `Failed to create components: ${ failedNames.join( ', ' ) }`,
			id: 'failed-created-components-notification',
		};
		notify( failedNotification );
	}
}

function updateComponentInstances( elements: V1ElementData[], uidToComponentId: Map< string, number > ): void {
	elements.forEach( ( element ) => {
		if ( element.widgetType === 'e-component' ) {
			const currentComponentId = ( element.settings?.component_instance as ComponentInstanceProp )?.value
				?.component_id.value;

			if ( currentComponentId && uidToComponentId.has( currentComponentId.toString() ) ) {
				updateElementSettings( {
					id: element.id,
					props: {
						component_instance: {
							$$type: 'component-instance',
							value: {
								component_id: {
									$$type: 'number',
									value: uidToComponentId.get( currentComponentId.toString() ) as number,
								},
							},
						},
					},
					withHistory: false,
				} );
			}
		}

		if ( element.elements ) {
			updateComponentInstances( element.elements, uidToComponentId );
		}
	} );
}
