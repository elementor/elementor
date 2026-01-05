import { __dispatch as dispatch } from '@elementor/store';

import { slice } from '../store';

export const renameComponent = ( componentUid: string, newName: string ) => {
	dispatch( slice.actions.rename( { componentUid, name: newName } ) );
};
