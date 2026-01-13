import { type V1Document } from '@elementor/editor-documents';
import { type V1Element, type V1ElementData } from '@elementor/editor-elements';

import { type DocumentSaveStatus } from '../types';
import { createComponentsBeforeSave } from './create-components-before-save';
import { setComponentOverridablePropsSettingsBeforeSave } from './set-component-overridable-props-settings-before-save';
import { updateArchivedComponentBeforeSave } from './update-archived-component-before-save';
import { updateComponentTitleBeforeSave } from './update-component-title-before-save';
import { updateComponentsBeforeSave } from './update-components-before-save';

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
		updateArchivedComponentBeforeSave(),
		createComponentsBeforeSave( { elements, status } ),
		updateComponentsBeforeSave( { elements, status } ),
		setComponentOverridablePropsSettingsBeforeSave( { container } ),
		updateComponentTitleBeforeSave(),
	] );
};
