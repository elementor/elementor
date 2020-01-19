import DocumentHelper from '../helper';
//import * as commands from './commands/index.spec.js';
import * as commandsInternal from './commands/internal/index.spec.js';

jQuery( () => {
	QUnit.module( 'Component: document/save', ( hooks ) => {
		DocumentHelper.testCommands( commandsInternal );
	} );
} );
