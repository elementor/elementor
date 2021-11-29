export const Close = () => {
	QUnit.module( 'Close', () => {
		QUnit.test( 'Simple', ( assert ) => {
			// Arrange.
			if ( ! elementor.navigator.isOpen ) {
				$e.run( 'navigator/open' );
			}

			// Act.
			$e.run( 'navigator/close' );

			// Assert.
			assert.equal( elementor.navigator.isOpen, false );
		} );
	} );
};

export default Close;
