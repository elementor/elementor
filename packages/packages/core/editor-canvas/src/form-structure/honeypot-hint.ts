import { type NotificationData, notify } from '@elementor/editor-notifications';
import { type HookOptions, registerDataHook } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { type CreateArgs, FORM_HONEYPOT_ELEMENT_TYPE, getArgsElementType } from './utils';

const MOVE_COMMAND = 'document/elements/move';

let notificationCounter = 0;

function createHoneypotNotification(): NotificationData {
	return {
		type: 'default',
		message: __( 'Honeypot added - invisible on your form. Reorder it in the Structure panel.', 'elementor' ),
		id: `honeypot-added-${ ++notificationCounter }`,
	};
}

export function initHoneypotHint() {
	registerDataHook( 'after', 'document/elements/create', ( args: CreateArgs, _result, options?: HookOptions ) => {
		if ( options?.commandsCurrentTrace?.includes( MOVE_COMMAND ) ) {
			return;
		}

		if ( getArgsElementType( args ) === FORM_HONEYPOT_ELEMENT_TYPE ) {
			notify( createHoneypotNotification() );
		}
	} );
}
