import { V1Element } from '@elementor/editor-elements';
import { type DocumentSaveStatus } from '../types';
import { createComponentsBeforeSave } from './create-components-before-save';
import { setComponentOverridablePropsSettingsBeforeSave } from './set-component-overridable-props-settings-before-save';
import { updateComponentsBeforeSave } from './update-components-before-save';

type Options = {
	container: V1Element;
	status: DocumentSaveStatus;
};

export const beforeSave = ( { container, status }: Options ) => {
	const elements = container.model.get( 'elements' )?.toJSON() ?? [];

	return Promise.all( [
		createComponentsBeforeSave( { elements, status } ),
		updateComponentsBeforeSave( { elements, status } ),
		setComponentOverridablePropsSettingsBeforeSave( { container } ),
	] );
};
