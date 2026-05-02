import { Fragment, useEffect } from 'react';
import * as React from 'react';
import { closeSnackbar, useSnackbar, type VariantType } from 'notistack';
import { __useDispatch as useDispatch } from '@elementor/store';
import { Button, CloseButton } from '@elementor/ui';

import { clearAction } from '../slice';
import type { NotificationData, Notifications } from '../types';

const AUTO_HIDE_DURATION = 8000;

function createDefaultAction( notification: NotificationData, onDismiss: () => void ) {
	return (
		<Fragment key={ notification.id }>
			{ notification.additionalActionProps?.map( ( additionalAction, index ) => (
				<Button key={ `${ index }` } { ...additionalAction } />
			) ) }

			<CloseButton aria-label="close" color="inherit" onClick={ onDismiss } />
		</Fragment>
	);
}

function createPromotionAction( notification: NotificationData ) {
	return (
		<Fragment key={ notification.id }>
			{ notification.additionalActionProps?.map( ( additionalAction, index ) => (
				<Button key={ `${ index }` } { ...additionalAction } />
			) ) }
		</Fragment>
	);
}

export const useEnqueueNotification = ( notifications: Notifications ) => {
	const { enqueueSnackbar } = useSnackbar();
	const dispatch = useDispatch();

	useEffect( () => {
		Object.values( notifications ).forEach( ( notification ) => {
			const dismiss = () => {
				closeSnackbar( notification.id );
				dispatch( clearAction( { id: notification.id } ) );
			};

			const useAlertAction = [ 'promotion', 'info' ].includes( notification.type );

			const action = useAlertAction
				? createPromotionAction( notification )
				: createDefaultAction( notification, dismiss );

			enqueueSnackbar( notification.message, {
				variant: notification.type as VariantType,
				key: notification.id,
				onClose: () => dispatch( clearAction( { id: notification.id } ) ),
				preventDuplicate: true,
				action,
				autoHideDuration: notification.autoHideDuration ?? AUTO_HIDE_DURATION,
			} );
		} );
	}, [ notifications, enqueueSnackbar, dispatch ] );
};
