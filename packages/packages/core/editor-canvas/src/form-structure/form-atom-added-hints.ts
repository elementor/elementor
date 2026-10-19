import { notify } from '@elementor/editor-notifications';
import { type HookOptions, registerDataHook } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import {
	type CreateArgs,
	FORM_HONEYPOT_ELEMENT_TYPE,
	FORM_RECAPTCHA_SCORE_ELEMENT_TYPE,
	getArgsElementType,
} from './utils';

const MOVE_COMMAND = 'document/elements/move';

type FormAtomHint = {
	idPrefix: string;
	getMessage: () => string;
};

const FORM_ATOM_HINTS: Record< string, FormAtomHint > = {
	[ FORM_HONEYPOT_ELEMENT_TYPE ]: {
		idPrefix: 'honeypot-added',
		getMessage: () =>
			__( 'Honeypot added - invisible on your form. Reorder it in the Structure panel.', 'elementor' ),
	},
	[ FORM_RECAPTCHA_SCORE_ELEMENT_TYPE ]: {
		idPrefix: 'recaptcha-score-added',
		getMessage: () =>
			__( 'reCAPTCHA Score added - You can adjust its settings from the Structure panel', 'elementor' ),
	},
};

let notificationCounter = 0;

export function initFormAtomAddedHints() {
	registerDataHook( 'after', 'document/elements/create', ( args: CreateArgs, _result, options?: HookOptions ) => {
		if ( options?.commandsCurrentTrace?.includes( MOVE_COMMAND ) ) {
			return;
		}

		const elementType = getArgsElementType( args );
		const hint = elementType ? FORM_ATOM_HINTS[ elementType ] : undefined;

		if ( ! hint ) {
			return;
		}

		notify( {
			type: 'default',
			message: hint.getMessage(),
			id: `${ hint.idPrefix }-${ ++notificationCounter }`,
		} );
	} );
}
