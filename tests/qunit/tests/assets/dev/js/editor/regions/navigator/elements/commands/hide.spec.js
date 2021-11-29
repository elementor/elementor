import ElementsHelper from 'elementor-tests-qunit/tests/assets/dev/js/editor/document/elements/helper';

export const Hide = () => {
	QUnit.module( 'Hide', () => {
		QUnit.test( 'Simple', ( assert ) => {
			// Arrange.
			const eButton = ElementsHelper.createAutoButton();

			// Act.
			$e.run( 'navigator/elements/hide', {
				container: eButton,
			} );

			// Assert.
			assert.equal( eButton.model.get( 'hidden' ), true );
		} );
	} );
};

export default Hide;
