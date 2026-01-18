import { type V1Document } from '@elementor/editor-documents';
import { type V1Element, type V1ElementData } from '@elementor/editor-elements';

import { type DocumentSaveStatus } from '../types';
import { setComponentOverridablePropsSettingsBeforeSave } from './set-component-overridable-props-settings-before-save';
import { syncComponentsBeforeSave } from './sync-components-before-save';

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

export const beforeSave = async ( { container, status }: Options ) => {
	setComponentOverridablePropsSettingsBeforeSave( { container } );

	const elements = container?.model.get( 'elements' ).toJSON?.() ?? [];

	await syncComponentsBeforeSave( { elements, status } );
};
