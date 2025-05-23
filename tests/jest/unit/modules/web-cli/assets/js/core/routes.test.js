import { freeMock, setupMock } from './mock/api';

describe( '$e.routes', () => {
	beforeAll( async () => {
		await setupMock();

		// Register component to the api.
		$e.components.register( new class extends $e.modules.ComponentBase {
			getNamespace() {
				return 'test-component';
			}

			defaultRoutes() {
				return {
					'test-route': () => 'test-result',
				};
			}
		} );
	} );

	afterAll( () => freeMock() );

	test( 'beforeRun() -- Ensure route added to commands global trace', () => {
		// Arrange.
		const trace = [],
			beforeRunOrig = $e.routes.beforeRun;

		$e.routes.beforeRun = ( ... args ) => {
			beforeRunOrig.apply( $e.routes, args );

			// Save it for the assertion.
			trace.push( ... $e.commands.constructor.trace );
		};

		// Act.
		$e.route( 'test-component/test-route' );

		// Assert - Ensure route added to commands global trace.
		expect( trace ).toEqual( [ 'test-component/test-route' ] );

		// Cleanup.
		$e.routes.beforeRun = beforeRunOrig;
	} );

	test( 'afterRun() -- Ensure route leave global commands trace', () => {
		// Act
		$e.route( 'test-component/test-route' );

		// Assert.
		expect( $e.commands.constructor.trace ).toEqual( [] );
	} );
} );
