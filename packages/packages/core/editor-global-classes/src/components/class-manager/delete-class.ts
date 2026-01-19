import { getV1DocumentsManager } from '@elementor/editor-documents';
import { getElements, getElementSetting, updateElementSettings } from '@elementor/editor-elements';
import { classesPropTypeUtil, type ClassesPropValue } from '@elementor/editor-props';
import { __dispatch as dispatch } from '@elementor/store';

import { slice } from '../../store';
import { trackGlobalClasses } from '../../utils/tracking';

let deletedClassId: string | null = null;

export const deleteClass = ( id: string ) => {
	trackGlobalClasses( {
		event: 'classDeleted',
		classId: id,
		runAction: () => {
			dispatch( slice.actions.delete( id ) );
			deletedClassId = id;
		},
	} );
};

export const onDelete = async () => {
	if ( deletedClassId ) {
		removeClassFromAllElements( deletedClassId );
		invalidateDocumentCache();
	}

	deletedClassId = null;
};

export const hasDeletedItems = () => deletedClassId !== null;

// Remove the deleted class from all elements in the current document
const removeClassFromAllElements = ( classId: string ) => {
	const elements = getElements();

	elements.forEach( ( element ) => {
		const appliedClasses = getElementSetting< ClassesPropValue >( element.id, 'classes' )?.value || [];

		if ( appliedClasses.includes( classId ) ) {
			const updatedClassIds = appliedClasses.filter( ( id ) => id !== classId );

			updateElementSettings( {
				id: element.id,
				props: { classes: classesPropTypeUtil.create( updatedClassIds ) },
				withHistory: false,
			} );
		}
	} );
};

// Invalidate cache so future document loads get fresh data from server
const invalidateDocumentCache = () => {
	const documentsManager = getV1DocumentsManager();
	documentsManager.invalidateCache();
};
