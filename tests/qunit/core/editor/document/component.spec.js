import DocumentHelper from './helper';
import ElementsHelper from './elements/helper';
import * as Hooks from './callbacks/hooks/index.spec';

QUnit.module( 'Component: document', () => {
	QUnit.module( `Hooks`, ( hooks ) => {
		hooks.beforeEach( () => {
			ElementsHelper.empty();
		} );

		Object.entries( Hooks ).forEach( ( [ hookNamespace, hook ] ) => {
			QUnit.module( hookNamespace, () => {
				DocumentHelper.testCommands( hook );
			} );
		} );
	} );
} );
