export const Dock = () => {
	QUnit.module( 'Dock', () => {
		QUnit.test( 'Simple', ( assert ) => {
			// Arrange.
			if ( elementor.navigator.isDocked ) {
				$e.run( 'navigator/undock' );
			}

			// Act.
			$e.run( 'navigator/dock' );

			// Assert.
			assert.equal( elementor.navigator.isDocked, true );
		} );
	} );
};

export default Dock;
