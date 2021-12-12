import DocumentHelper from '../helper';
import ElementsHelper from 'elementor/tests/utils/js/document-elements-helper.mjs';
import * as commands from './commands/index.spec.js';

QUnit.module( 'Component: document/ui', ( hooks ) => {
	hooks.beforeEach = () => {
		ElementsHelper.empty();
	};

	DocumentHelper.testCommands( commands );
} );
