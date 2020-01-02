import DocumentHelper from '../helper';
import ElementsHelper from '../elements/helper';
import * as Commands from './commands/index.spec.js';

jQuery( () => {
	QUnit.module( 'Component: document/ui', ( hooks ) => {
		hooks.beforeEach = () => {
			ElementsHelper.empty();
		};

		DocumentHelper.testCommands( Commands );
	} );
} );
