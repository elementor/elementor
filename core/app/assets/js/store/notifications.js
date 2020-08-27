import { createSlice } from '@elementor/store';

const name = 'notifications';

const initialState = {
	active: [],
	history: [],
};

const notifications = createSlice( {
	name,
	initialState,
	reducers: {
		notify: ( state, action ) => {
			state.active = [
				{
					id: elementorCommon.helpers.getUniqueId(),
					...action.payload,
				},
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

export default notifications;
