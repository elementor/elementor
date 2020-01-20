import DocumentHelper from '../helper';
import * as commands from './commands/index.spec.js';
import * as commandsInternal from './commands/internal/index.spec.js';
import * as Ajax from 'elementor-tests-qunit/ajax';

jQuery( () => {
	QUnit.module( 'Component: document/save', ( hooks ) => {
		hooks.before( () => {
			// Hook `elementorCommon.ajax.send` mock.
			Ajax.mock();
		} );

		hooks.after( () => {
			// Hook `elementorCommon.ajax.send` silence (empty function).
			Ajax.silence();
		} );

		DocumentHelper.testCommands( commands );
		DocumentHelper.testCommands( commandsInternal );
	} );
} );
