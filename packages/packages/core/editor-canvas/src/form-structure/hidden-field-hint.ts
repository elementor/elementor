import { type NotificationData, notify } from '@elementor/editor-notifications';
import { type HookOptions, registerDataHook } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { type CreateArgs, getArgsElementType } from './utils';

const HIDDEN_FIELD_ELEMENT_TYPE = 'e-form-hidden';

const MOVE_COMMAND = 'document/elements/move';

let notificationCounter = 0;

function createHiddenFieldNotification(): NotificationData {
  return {
    type: 'default',
    message: __(
      'Hidden field added - invisible on your form. Manage it in the Structure panel.',
      'elementor'
    ),
    id: `hidden-field-added-${ ++notificationCounter }`,
  };
}

export function initHiddenFieldHint() {
  registerDataHook(
    'after',
    'document/elements/create',
    ( args: CreateArgs, _result, options?: HookOptions ) => {
      if ( options?.commandsCurrentTrace?.includes( MOVE_COMMAND ) ) {
        return;
      }

      if ( getArgsElementType( args ) === HIDDEN_FIELD_ELEMENT_TYPE ) {
        notify( createHiddenFieldNotification() );
      }
    }
  );
}
