import { createSlice } from '@elementor/store';

const name = 'notifications';

export const initialState = {
	active: [],
	history: [],
};

const slice = createSlice( {
	name,
	initialState,
	reducers: {
		notify: ( state, action ) => {
			state.active = [
				action.payload,
				...state.active,
			];
		},

		dismiss: ( state, action ) => {
			state.history = [
				state.active.find( ( notification ) => notification.id === action.payload ),
				...state.history,
			];

			state.active = state.active.filter( ( notification ) => notification.id !== action.payload );
		},
	},
} );

export const sliceActions = slice.actions;

export default slice;
