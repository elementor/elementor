import { getV1DocumentsManager, setDocumentModifiedStatus } from '@elementor/editor-documents';
import { getAllDescendants, type V1Element } from '@elementor/editor-elements';
import { __dispatch as dispatch } from '@elementor/store';

import { COMPONENT_WIDGET_TYPE } from '../../create-component-type';
import { slice } from '../store';

const TITLE_EXTERNAL_CHANGE_COMMAND = 'title_external_change';

export const renameComponent = ( componentUid: string, newName: string ) => {
	dispatch( slice.actions.rename( { componentUid, name: newName } ) );

	setDocumentModifiedStatus( true );

	refreshComponentInstanceTitles( componentUid );
};

function refreshComponentInstanceTitles( componentUid: string ) {
	const documentContainer = getDocumentContainer();

	if ( ! documentContainer ) {
		return;
	}

	const componentInstances = findComponentInstancesByUid( documentContainer, componentUid );

	componentInstances.forEach( ( element ) => {
		element.model.trigger?.( TITLE_EXTERNAL_CHANGE_COMMAND );
	} );
}

function getDocumentContainer(): V1Element | undefined {
	const documentsManager = getV1DocumentsManager();

	return documentsManager?.getCurrent()?.container as V1Element | undefined;
}

function findComponentInstancesByUid( documentContainer: V1Element, componentUid: string ): V1Element[] {
	const allDescendants = getAllDescendants( documentContainer );

	return allDescendants.filter( ( element ) => {
		const widgetType = element.model.get( 'widgetType' );
		const editorSettings = element.model.get( 'editor_settings' );

		const isMatch = widgetType === COMPONENT_WIDGET_TYPE && editorSettings?.component_uid === componentUid;

		return isMatch;
	} );
}
