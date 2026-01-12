import { type V1ElementData } from '@elementor/editor-elements';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch } from '@elementor/store';
import { generateUniqueId } from '@elementor/utils';

import { type ComponentEventData } from '../../components/create-component-form/utils/get-component-event-data';
import { replaceElementWithComponent } from '../../components/create-component-form/utils/replace-element-with-component';
import { type OverridableProps } from '../../types';
import { cleanOverridablePropsFromElementData } from '../../utils/clean-overridable-props';
import { isEditingComponent } from '../../utils/is-editing-component';
import { trackComponentEvent } from '../../utils/tracking';
import { slice } from '../store';

export async function createUnpublishedComponent(
	name: string,
	element: V1ElementData,
	eventData: ComponentEventData | null,
	overridableProps?: OverridableProps,
	uid?: string | null
) {
	const generatedUid = uid ?? generateUniqueId( 'component' );
	const cleanedElement = isEditingComponent() ? cleanOverridablePropsFromElementData( element ) : element;
	const componentBase = { uid: generatedUid, name, overridableProps };

	dispatch(
		slice.actions.addUnpublished( {
			...componentBase,
			elements: [ cleanedElement ],
		} )
	);

	dispatch( slice.actions.addCreatedThisSession( generatedUid ) );

	const componentInstance = await replaceElementWithComponent( cleanedElement, componentBase );

	trackComponentEvent( {
		action: 'created',
		component_uid: generatedUid,
		component_name: name,
		...eventData,
	} );

	await runCommand( 'document/save/auto' );

	return { uid: generatedUid, instanceId: componentInstance.id };
}
