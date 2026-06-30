import { __createSlice, type PayloadAction } from '@elementor/store';

const initialState: {
	openId: string | null;
} = {
	openId: null,
};

export default __createSlice( {
	name: 'panels',
	initialState,
	reducers: {
		open( state, action: PayloadAction< string > ) {
			state.openId = action.payload;
		},
		close( state, action: PayloadAction< string | undefined > ) {
			if ( ! action.payload || state.openId === action.payload ) {
				state.openId = null;
			}
		},
	},
} );
