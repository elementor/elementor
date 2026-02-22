import { type V1Document } from '@elementor/editor-documents';
import { type V1Element, type V1ElementData } from '@elementor/editor-elements';

import { publishDraftComponentsInPageBeforeSave } from '../../sync/publish-draft-components-in-page-before-save';
import { type DocumentSaveStatus } from '../../types';
import { createComponentsBeforeSave } from './create-components-before-save';
import { setComponentOverridablePropsSettingsBeforeSave } from './set-component-overridable-props-settings-before-save';
import { updateArchivedComponentBeforeSave } from './update-archived-component-before-save';
import { updateComponentTitleBeforeSave } from './update-component-title-before-save';

type Options = {
	container: V1Element & {
		document: V1Document;
		model: {
			get: ( key: 'elements' ) => {
				toJSON: () => V1ElementData[];
			};
		};
	};
	status: DocumentSaveStatus;
};

export const beforeSave = ( { container, status }: Options ) => {
	const elements = container?.model.get( 'elements' ).toJSON?.() ?? [];

	return Promise.all( [
		syncComponents( { elements, status } ),
		setComponentOverridablePropsSettingsBeforeSave( { container } ),
	] );
};

// These operations run sequentially to prevent race conditions when multiple
// edits occur on the same component simultaneously.
// TODO: Consolidate these into a single PUT /components endpoint.
const syncComponents = async ( { elements, status }: { elements: V1ElementData[]; status: DocumentSaveStatus } ) => {
	// This order is important - first update existing components, then create new components,
	// Since new component validation depends on the existing components (preventing duplicate names).
	await updateExistingComponentsBeforeSave( { elements, status } );
	await createComponentsBeforeSave( { elements, status } );
};

const updateExistingComponentsBeforeSave = async ( {
	elements,
	status,
}: {
	elements: V1ElementData[];
	status: DocumentSaveStatus;
} ) => {
	await updateComponentTitleBeforeSave( status );
	await updateArchivedComponentBeforeSave( status );
	await publishDraftComponentsInPageBeforeSave( { elements, status } );
};
