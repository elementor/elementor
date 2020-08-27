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
	controllers: {
		notifyAnErrorDialog( { dispatch, actions }, payload ) {
			const notification = {
				id: elementorCommon.helpers.getUniqueId(),
				ui: 'dialog',
				props: {
					...payload,
				},
			};

			dispatch( actions.notify( notification ) );

			return notification;
		},
	},
} );

export default notifications;
