import { type V1Document } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';

import { componentsStore } from '../../store/dispatchers';
import { COMPONENT_DOCUMENT_TYPE } from '../consts';

export const setComponentOverridablePropsSettingsBeforeSave = ( {
	container,
}: {
	container: V1Element & { document: V1Document };
} ) => {
	const currentDocument = container.document;

	if ( ! currentDocument || currentDocument.config.type !== COMPONENT_DOCUMENT_TYPE ) {
		return;
	}

	const overridableProps = componentsStore.getOverridableProps( currentDocument.id );
	if ( overridableProps ) {
		container.settings.set( 'overridable_props', overridableProps );
	}
};
