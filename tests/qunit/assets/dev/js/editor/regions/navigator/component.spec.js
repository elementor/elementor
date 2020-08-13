import DocumentHelper from 'elementor-tests-qunit/assets/dev/js/editor/document/helper';
import * as commands from './commands/index.spec';

jQuery( () => {
	QUnit.module( 'Component: navigator', ( hooks ) => {
		// After handling all test(s), keep it close.
		hooks.after( () => $e.run( 'navigator/close' ) );

		DocumentHelper.testCommands( commands );
	} );
} );
