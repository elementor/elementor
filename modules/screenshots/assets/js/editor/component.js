import ComponentBase from 'elementor-api/modules/component-base';

import * as hooks from './hooks/';
import * as internalCommands from './commands/internal/';

export default class Component extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		/**
		 * Equals to true if capturing a screenshot is on process.
		 *
		 * @type {boolean}
		 */
		this.isCapturingScreenshot = false;

		elementorCommon.elements.$window.on( 'beforeunload', () => {
			if ( this.isCapturingScreenshot ) {
				// Returns a message to confirm dialog.
				return elementor.translate( 'before_unload_screenshot_alert' );
			}
		} );
	}

	getNamespace() {
		return 'screenshots';
	}

	defaultCommandsInternal() {
		return this.importCommands( internalCommands );
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
