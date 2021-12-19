export const Undock = () => {
	QUnit.module( 'Undock', () => {
		QUnit.test( 'Simple', ( assert ) => {
			// Arrange.
			if ( ! elementor.navigator.isDocked ) {
				$e.run( 'navigator/dock' );
			}

			// Act.
			$e.run( 'navigator/undock' );

			// Assert.
			assert.equal( elementor.navigator.isDocked, false );
		} );
	} );
};

export default Undock;
