export const Toggle = () => {
	QUnit.module( 'Toggle', () => {
		QUnit.test( 'Simple', ( assert ) => {
			// Arrange.
			const initialState = elementor.navigator.isOpen;

			// Act.
			$e.run( 'navigator/toggle' );

			// Assert.
			assert.equal( elementor.navigator.isOpen, ! initialState );

			// Act.
			$e.run( 'navigator/toggle' );

			// Assert.
			assert.equal( elementor.navigator.isOpen, initialState );
		} );
	} );
};

export default Toggle;
