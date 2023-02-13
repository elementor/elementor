import DocumentHelper from '../helper';
import * as commands from './commands/index.spec.js';

QUnit.module( 'Component: document/dynamic', () => {
	DocumentHelper.testCommands( commands );
} );
