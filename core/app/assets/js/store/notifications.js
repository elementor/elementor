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
			state.active = [ action.payload, ...state.active ];
		},

		dismiss: ( state, action ) => {
			const findNotificationCallback = ( notification ) => notification.id === action.payload;

			state.history = [
				state.active.find( findNotificationCallback ),
				...state.history,
			];

			state.active = state.filter( () => ! findNotificationCallback() );
		},
	},
} );

export default notifications;
