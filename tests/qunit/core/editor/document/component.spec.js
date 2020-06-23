import DocumentHelper from './helper';
import ElementsHelper from './elements/helper';
import * as hooksData from './hooks/data/document/elements/index.spec';

QUnit.module( 'Component: document', () => {
	QUnit.module( `Hooks`, ( hooks ) => {
		hooks.beforeEach( () => {
			ElementsHelper.empty();
		} );

		Object.entries( hooksData ).forEach( ( [ hookNamespace, hook ] ) => {
			QUnit.module( hookNamespace, () => {
				DocumentHelper.testCommands( hook );
			} );
		} );
	} );
} );
