import { __createSlice as createSlice, __getStore as getStore, type PayloadAction } from '@elementor/store';

import { type DialogData, type DialogState } from './types';

export const SLICE_NAME = 'globalDialog';

const initialState: DialogState = {
	activeDialog: null,
};

export const globalDialogSlice = createSlice( {
	name: SLICE_NAME,
	initialState,
	reducers: {
		open: ( state, action: PayloadAction< DialogData > ) => {
			state.activeDialog = action.payload;
		},
		close: ( state ) => {
			state.activeDialog = null;
		},
	},
} );

export const { open, close } = globalDialogSlice.actions;

let resolver: ( ( value: string ) => void ) | null = null;

export const openDialog = ( dialog: {
	dialogType: 'warning' | 'error' | 'success';
	title: string;
	content: React.ReactElement;
	actions: { text: string; type?: string; value: string }[];
} ): Promise< string > => {
	return new Promise( ( resolve ) => {
		resolver = resolve;

		// Save the action values, NOT functions
		getStore()?.dispatch(
			open( {
				title: dialog.title,
				content: dialog.content,
				actions: dialog.actions,
			} )
		);
	} );
};

// Called from UI
export const resolveDialog = ( value: string ) => {
	if ( resolver ) {
		resolver( value );
		getStore()?.dispatch( close() );
		resolver = null;
	}
};
