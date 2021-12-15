import DocumentHelper from '../helper';
import ElementsHelper from 'elementor/tests/qunit/tests/assets/dev/js/editor/document/elements/helper';
import * as commands from './commands/index.spec.js';

QUnit.module( 'Component: document/ui', ( hooks ) => {
	hooks.beforeEach = () => {
		ElementsHelper.empty();
	};

	DocumentHelper.testCommands( commands );
} );
