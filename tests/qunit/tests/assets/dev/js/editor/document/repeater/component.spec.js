import DocumentHelper from '../helper';
import * as commands from './commands/index.spec.js';

jQuery( () => {
	QUnit.module( 'Component: document/repeater', () => {
		DocumentHelper.testCommands( commands );
	} );
} );
