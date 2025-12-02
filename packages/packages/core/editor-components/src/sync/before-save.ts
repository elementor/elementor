import { type Container, type DocumentSaveStatus } from '../types';
import { createComponentsBeforeSave } from './create-components-before-save';
import { updateArchivedComponentBeforeSave } from './update-archived-component-before-save';
import { updateComponentsBeforeSave } from './update-components-before-save';

type Options = {
	container: Container;
	status: DocumentSaveStatus;
};

export const beforeSave = ( { container, status }: Options ) => {
	return Promise.all( [
		createComponentsBeforeSave( { container, status } ),
		updateComponentsBeforeSave( { container, status } ),
		updateArchivedComponentBeforeSave(),
	] );
};
