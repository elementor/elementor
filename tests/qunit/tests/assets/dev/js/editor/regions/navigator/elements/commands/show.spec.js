import ElementsHelper from 'elementor-tests-qunit/tests/assets/dev/js/editor/document/elements/helper';

export const Show = () => {
	QUnit.module( 'Show', () => {
		QUnit.test( 'Simple', ( assert ) => {
			// Arrange.
			const eButton = ElementsHelper.createAutoButton();

			// Act.
			$e.run( 'navigator/elements/show', {
				container: eButton,
			} );

			// Assert.
			assert.equal( eButton.model.get( 'hidden' ), false );
		} );
	} );
};

export default Show;
