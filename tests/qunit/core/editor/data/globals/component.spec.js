import DocumentHelper from 'elementor-tests-qunit/core/editor/document/helper';
import * as dataCommands from './commands/data/index.spec';

jQuery( () => {
	QUnit.module( 'Component: globals', () => {
		DocumentHelper.testCommands( dataCommands );

		require( './colors/component.spec' );
		require( './typography/component.spec' );
	} );
} );
