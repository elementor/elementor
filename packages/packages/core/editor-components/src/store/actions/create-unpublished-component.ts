import { createElements, deleteElement, getContainer, type V1ElementData } from '@elementor/editor-elements';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch } from '@elementor/store';
import { generateUniqueId } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { type ComponentEventData } from '../../components/create-component-form/utils/get-component-event-data';
import { replaceElementWithComponent } from '../../components/create-component-form/utils/replace-element-with-component';
import { type OriginalElementData, type OverridableProps } from '../../types';
import { revertAllOverridablesInElementData } from '../../utils/revert-overridable-settings';
import { type Source, trackComponentEvent } from '../../utils/tracking';
import { slice } from '../store';

type CreateUnpublishedComponentParams = {
	name: string;
	element: V1ElementData;
	eventData: ComponentEventData | null;
	uid?: string | null;
	overridableProps?: OverridableProps;
	source: Source;
};

export async function createUnpublishedComponent( {
	name,
	element,
	eventData,
	uid,
	overridableProps,
	source,
}: CreateUnpublishedComponentParams ): Promise< { uid: string; instanceId: string } > {
	const generatedUid = uid ?? generateUniqueId( 'component' );
	const componentBase = { uid: generatedUid, name };
	const elementDataWithOverridablesReverted = revertAllOverridablesInElementData( element );

	const container = getContainer( element.id );
	const modelFromContainer = container?.model?.toJSON?.() as V1ElementData | undefined;
	const originalElement: OriginalElementData = {
		model: modelFromContainer ?? element,
		parentId: container?.parent?.id ?? '',
		index: container?.view?._index ?? 0,
	};

	dispatch(
		slice.actions.addUnpublished( {
			...componentBase,
			elements: [ elementDataWithOverridablesReverted ],
			overridableProps,
		} )
	);

	dispatch( slice.actions.addCreatedThisSession( generatedUid ) );

	const componentInstance = await replaceElementWithComponent( element, componentBase );

	trackComponentEvent( {
		action: 'created',
		source,
		component_uid: generatedUid,
		component_name: name,
		...eventData,
	} );

	try {
		await runCommand( 'document/save/auto' );
	} catch ( error ) {
		restoreOriginalElement( originalElement, componentInstance.id );

		dispatch( slice.actions.removeUnpublished( generatedUid ) );
		dispatch( slice.actions.removeCreatedThisSession( generatedUid ) );

		throw error;
	}

	return { uid: generatedUid, instanceId: componentInstance.id };
}

function restoreOriginalElement( originalElement: OriginalElementData, componentInstanceId: string ): void {
	deleteElement( { elementId: componentInstanceId, options: { useHistory: false } } );

	const clonedModel = structuredClone( originalElement.model );

	createElements( {
		title: __( 'Restore Element', 'elementor' ),
		elements: [
			{
				containerId: originalElement.parentId,
				model: clonedModel as Parameters< typeof createElements >[ 0 ][ 'elements' ][ 0 ][ 'model' ],
				options: { at: originalElement.index },
			},
		],
	} );
}
