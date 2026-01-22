import { __dispatch as dispatch } from '@elementor/store';

import { slice } from '../../store';
import { trackGlobalClasses } from '../../utils/tracking';

let isDeleted = false;

export const deleteClass = ( id: string ) => {
	trackGlobalClasses( {
		event: 'classDeleted',
		classId: id,
		runAction: () => {
			dispatch( slice.actions.delete( id ) );
			isDeleted = true;
		},
	} );
};

export const onDelete = async () => {
	isDeleted = false;
};

export const hasDeletedItems = () => isDeleted;
