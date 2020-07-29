import DocumentHelper from 'elementor-tests-qunit/core/editor/document/helper';
import * as commandsInternal from './commands/internal/index.spec.js';

jQuery( () => {
	QUnit.module( 'Component: Screenshots', () => {
		DocumentHelper.testCommands( commandsInternal );
	} );
} );
