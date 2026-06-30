import { parallelTest as test } from '../parallelTest';
import { generatePluginTests } from './plugin-tester-generator';

test.describe.configure( { mode: 'parallel' } );

test.describe( `Plugin tester tests: containers @plugin_tester_container`, () => {
	generatePluginTests( 'containers' );
} );
