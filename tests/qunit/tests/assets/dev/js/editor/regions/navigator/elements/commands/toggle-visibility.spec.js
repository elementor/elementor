import ElementsHelper from 'elementor-tests-qunit/tests/assets/dev/js/editor/document/elements/helper';

export const ToggleVisibility = () => {
	QUnit.module( 'ToggleVisibility', () => {
		QUnit.test( 'Simple', ( assert ) => {
			// Arrange.
			const eButton = ElementsHelper.createAutoButton();

			// Act.
			$e.run( 'navigator/elements/toggle-visibility', {
				container: eButton,
			} );

			// Assert.
			assert.equal( eButton.model.get( 'hidden' ), true );

			// Act.
			$e.run( 'navigator/elements/toggle-visibility', {
				container: eButton,
			} );

			// Assert.
			assert.equal( eButton.model.get( 'hidden' ), false );
		} );
	} );
};

export default ToggleVisibility;
