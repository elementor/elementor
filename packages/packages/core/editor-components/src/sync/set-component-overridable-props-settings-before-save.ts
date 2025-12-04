import { type V1Document } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';
import { __getState as getState } from '@elementor/store';

import { COMPONENT_DOCUMENT_TYPE } from '../components/consts';
import { selectOverridableProps } from '../store/store';

export const setComponentOverridablePropsSettingsBeforeSave = ( {
	container,
}: {
	container: V1Element & { document: V1Document };
} ) => {
	const currentDocument = container.document;

	if ( ! currentDocument || currentDocument.config.type !== COMPONENT_DOCUMENT_TYPE ) {
		return;
	}

	const overridableProps = selectOverridableProps( getState(), currentDocument.id );
	if ( overridableProps ) {
		container.settings.set( 'overridable_props', overridableProps );
	}
};
