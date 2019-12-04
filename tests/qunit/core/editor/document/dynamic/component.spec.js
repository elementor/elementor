import DocumentHelper from '../helper';
import * as Commands from './commands/index.spec.js';

QUnit.module( 'Component: document/dynamic', () => {
	DocumentHelper.testCommands( Commands );
} );
