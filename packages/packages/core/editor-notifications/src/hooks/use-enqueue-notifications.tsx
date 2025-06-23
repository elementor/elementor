import { Fragment, useEffect } from 'react';
import * as React from 'react';
import { closeSnackbar, useSnackbar, type VariantType } from 'notistack';
import { __useDispatch as useDispatch } from '@elementor/store';
import { Button, CloseButton } from '@elementor/ui';

import { clearAction } from '../slice';
import type { Notifications } from '../types';

export const useEnqueueNotification = ( notifications: Notifications ) => {
	const { enqueueSnackbar } = useSnackbar();
	const dispatch = useDispatch();

	useEffect( () => {
		Object.values( notifications ).forEach( ( notification ) => {
			const Action = () => (
				<Fragment key={ notification.id }>
					{ notification.additionalActionProps?.map( ( additionalAction, index ) => (
						<Button key={ `${ index }` } { ...additionalAction } />
					) ) }

					<CloseButton
						aria-label="close"
						color="inherit"
						onClick={ () => {
							closeSnackbar( notification.id );
							dispatch( clearAction( { id: notification.id } ) );
						} }
					></CloseButton>
				</Fragment>
			);

			enqueueSnackbar( notification.message, {
				persist: true,
				variant: notification.type as VariantType,
				key: notification.id,
				onClose: () => dispatch( clearAction( { id: notification.id } ) ),
				preventDuplicate: true,
				action: <Action />,
			} );
		} );
	}, [ notifications, enqueueSnackbar, dispatch ] );
};
