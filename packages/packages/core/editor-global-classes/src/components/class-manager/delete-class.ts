import { doUnapplyClass } from '@elementor/editor-editing-panel';
import { getElements } from '@elementor/editor-elements';
import { __dispatch as dispatch } from '@elementor/store';

import { slice } from '../../store';
import { trackGlobalClasses } from '../../utils/tracking';

const deletedClassIds = new Set< string >();

export const deleteClass = ( id: string ) => {
	trackGlobalClasses( {
		event: 'classDeleted',
		classId: id,
		runAction: () => {
			dispatch( slice.actions.delete( id ) );
			deletedClassIds.add( id );
		},
	} );
};

export const removeDeletedClassesFromElements = async () => {
	const idsToCleanup = [ ...deletedClassIds ];
	deletedClassIds.clear();

	getElements().forEach( ( element ) => {
		idsToCleanup.forEach( ( classId ) => doUnapplyClass( element.id, classId ) );
	} );
};

export const clearDeletedItems = () => {
	deletedClassIds.clear();
};

export const hasDeletedItems = () => deletedClassIds.size > 0;
