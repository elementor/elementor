import DocumentHelper from '../../document/helper';
import * as commands from './commands/index.spec.js';

QUnit.module( 'Component: preview', () => {
	DocumentHelper.testCommands( commands );
} );
