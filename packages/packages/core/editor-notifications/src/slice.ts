import { __createSlice as createSlice } from '@elementor/store';

import { type Notifications } from './types';

export const notificationsSlice = createSlice( {
	name: 'notifications',
	initialState: {} as Notifications,
	reducers: {
		notifyAction: ( state, action ) => {
			const newState = { ...state };
			if ( ! newState[ action.payload.id ] ) {
				newState[ action.payload.id ] = action.payload;
			}

			return newState;
		},
		clearAction: ( state, action ) => {
			const newState = { ...state };
			if ( newState[ action.payload.id ] ) {
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete newState[ action.payload.id ];
			}

			return newState;
		},
	},
} );

export const { notifyAction, clearAction } = notificationsSlice.actions;
