import DocumentHelper from 'elementor-tests-qunit/tests/assets/dev/js/editor/document/helper';
import ElementsHelper from 'elementor-tests-qunit/tests/assets/dev/js/editor/document/elements/helper';
import * as commands from './commands/index.spec';

QUnit.module( 'Component: navigator/elements', ( hooks ) => {
	hooks.beforeEach( () => {
		// Have clean board with open navigator.
		for ( const element of elementor.elements.models ) {
			$e.run( 'document/elements/delete', { container: element.id } );
		}

		if ( ! elementor.navigator.isOpen ) {
			$e.run( 'navigator/open' );
		}
	} );

	DocumentHelper.testCommands( commands );
} );
