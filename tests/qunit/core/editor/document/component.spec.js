import DocumentHelper from './helper';
import * as Hooks from './callbacks/hooks/index.spec';

QUnit.module( 'Component: document', () => {
	QUnit.module( `Hooks`, () => {
		Object.entries( Hooks ).forEach( ( [ hookNamespace, hooks ] ) => {
			QUnit.module( hookNamespace, () => {
				DocumentHelper.testCommands( hooks );
			} );
		} );
	} );
} );
