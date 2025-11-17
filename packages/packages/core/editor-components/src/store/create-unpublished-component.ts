import { type V1ElementData } from '@elementor/editor-elements';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch } from '@elementor/store';
import { generateUniqueId } from '@elementor/utils';

import { type ComponentEventData } from '../components/create-component-form/utils/get-component-event-data';
import { replaceElementWithComponent } from '../components/create-component-form/utils/replace-element-with-component';
import { trackComponentEvent } from '../utils/tracking';
import { slice } from './store';

export function createUnpublishedComponent(
	name: string,
	element: V1ElementData,
	eventData: ComponentEventData | null
) {
	const uid = generateUniqueId( 'component' );
	const componentBase = { uid, name };

	dispatch(
		slice.actions.addUnpublished( {
			...componentBase,
			elements: [ element ],
		} )
	);

	dispatch( slice.actions.addCreatedThisSession( uid ) );

	replaceElementWithComponent( element, componentBase );

	trackComponentEvent( {
		action: 'created',
		component_uid: uid,
		component_name: name,
		...eventData,
	} );

	runCommand( 'document/save/auto' );

	return uid;
}
