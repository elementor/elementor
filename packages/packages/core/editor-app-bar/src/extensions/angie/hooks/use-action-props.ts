import { useCallback } from 'react';
import { AngieInteractionMode } from '@elementor/editor-angie-sdk';
import { dismissNotification, notify } from '@elementor/editor-notifications';
import { AngieIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { ANGIE_GUIDE_TOGGLE_EVENT } from '../angie-consts';

const ANGIE_OPEN_ERROR_NOTIFICATION_ID = 'angie-top-bar-open-error';

const getOpenAngieHost = () => window.elementorV2?.editorAngie?.openAngie;

export function useActionProps() {
	const angieState = window.elementorV2?.editorAngie?.getAngieState?.() ?? 'hidden';
	const visible = angieState !== 'hidden';

	const openAngieHost = useCallback( async () => {
		const openAngie = getOpenAngieHost();

		try {
			if ( ! openAngie ) {
				throw new Error( 'Angie host is not available' );
			}

			await openAngie( {
				prompt: '',
				mode: AngieInteractionMode.ASK,
			} );
		} catch {
			notify( {
				id: ANGIE_OPEN_ERROR_NOTIFICATION_ID,
				type: 'error',
				message: __( 'Something went wrong while opening Angie.', 'elementor' ),
				additionalActionProps: [
					{
						size: 'small',
						variant: 'outlined',
						color: 'error',
						children: __( 'Retry', 'elementor' ),
						onClick: () => {
							dismissNotification( ANGIE_OPEN_ERROR_NOTIFICATION_ID );
							void openAngieHost();
						},
					},
				],
			} );
		}
	}, [] );

	const onClick = useCallback( () => {
		if ( angieState === 'promo' ) {
			window.dispatchEvent( new CustomEvent( ANGIE_GUIDE_TOGGLE_EVENT ) );
			return;
		}

		if ( angieState === 'plugin' || angieState === 'sdk' ) {
			void openAngieHost();
		}
	}, [ angieState, openAngieHost ] );

	return {
		title: __( 'Angie', 'elementor' ),
		icon: AngieIcon,
		onClick,
		selected: false,
		visible,
	};
}
