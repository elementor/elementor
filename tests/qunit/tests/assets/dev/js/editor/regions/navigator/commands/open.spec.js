export const Open = () => {
	QUnit.module( 'Open', () => {
		QUnit.test( 'Simple', ( assert ) => {
			// Arrange.
			if ( elementor.navigator.isOpen ) {
				$e.run( 'navigator/close' );
			}

			// Act.
			$e.run( 'navigator/open' );

			// Assert.
			assert.equal( elementor.navigator.isOpen, true );
		} );
	} );
};

export default Open;
