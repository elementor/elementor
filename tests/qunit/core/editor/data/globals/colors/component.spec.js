import DocumentHelper from 'elementor-tests-qunit/core/editor/document/helper';
import * as commands from './commands/index.spec';

jQuery( () => {
	QUnit.module( 'Component: globals/colors', () => {
		DocumentHelper.testCommands( commands );
	} );
} );
