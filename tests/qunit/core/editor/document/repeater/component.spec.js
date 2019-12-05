import DocumentHelper from '../helper';
import * as Commands from './commands/index.spec.js';

jQuery( () => {
	QUnit.module( 'Component: document/repeater', () => {
		DocumentHelper.testCommands( Commands );
	} );
} );
