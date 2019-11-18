import DocumentHelper from './helper';
import * as Hooks from './hooks/index.spec.js';

QUnit.module( 'Component: document', () => {
	QUnit.module( `Hooks`, () => {
		Object.entries( Hooks ).forEach( ( [ hookNamespace, hooks ] ) => {
			QUnit.module( hookNamespace, () => {
				DocumentHelper.testCommands( hooks );
			} );
		} );
	} );
} );
