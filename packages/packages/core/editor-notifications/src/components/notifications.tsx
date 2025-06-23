import * as React from 'react';
import { forwardRef } from 'react';
import { SnackbarProvider } from 'notistack';
import { __getStore as getStore, __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';
import { SnackbarContent, type SnackbarProps, ThemeProvider } from '@elementor/ui';

import { useEnqueueNotification } from '../hooks/use-enqueue-notifications';
import { notifyAction } from '../slice';
import { getEditingPanelWidth } from '../sync/get-editing-panel-width';
import { type NotificationData, type Notifications } from '../types';

const DefaultCustomSnackbar = forwardRef( ( props: SnackbarProps, ref ) => {
	const filteredProps = getFilteredSnackbarProps( props );
	const panelWidth = getEditingPanelWidth();

	return (
		<ThemeProvider palette="unstable">
			<SnackbarContent
				ref={ ref }
				{ ...filteredProps }
				sx={ {
					'&.MuiPaper-root': { minWidth: 'max-content' },
					ml: panelWidth + 'px',
				} }
			/>
		</ThemeProvider>
	);
} );

const muiToEuiMapper = {
	default: DefaultCustomSnackbar,
};

const Handler = () => {
	const notifications = useSelector( ( state: { notifications: Notifications } ) => state.notifications );

	useEnqueueNotification( notifications );

	return null;
};

const Wrapper = () => {
	return (
		<SnackbarProvider
			maxSnack={ 3 }
			autoHideDuration={ 8000 }
			anchorOrigin={ { horizontal: 'center', vertical: 'bottom' } }
			Components={ muiToEuiMapper }
		>
			<Handler />
		</SnackbarProvider>
	);
};

/*
 * This function can be used to trigger notifications from anywhere in the code.
 * even if you're running in a JS environment as opposed to a React environment.
 */
export function notify( notification: NotificationData ) {
	const store = getStore();

	store?.dispatch( notifyAction( notification ) );
}

/*
 * This function can be used to trigger notifications from within a React component.
 * This is the preferred way to trigger notifications.
 */
export function NotifyReact( notification: NotificationData ) {
	const dispatch = useDispatch();
	dispatch( notifyAction( notification ) );
}

function getFilteredSnackbarProps( props: SnackbarProps ) {
	const forbiddenProps = [ 'autoHideDuration', 'persist', 'hideIconVariant', 'iconVariant', 'anchorOrigin' ];

	return Object.entries( props ).reduce(
		( filteredProps, [ key, value ] ) => {
			if ( ! forbiddenProps.includes( key ) ) {
				filteredProps[ key ] = value;
			}

			return filteredProps;
		},
		{} as Record< string, unknown >
	);
}

export default Wrapper;
