import DocumentHelper from '../helper';
import * as commands from './commands/index.spec.js';

QUnit.module( 'Component: document/globals', () => {
	DocumentHelper.testCommands( commands );
} );
