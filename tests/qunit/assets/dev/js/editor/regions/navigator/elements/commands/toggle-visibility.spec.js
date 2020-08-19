import ElementsHelper from 'elementor-tests-qunit/assets/dev/js/editor/document/elements/helper';

export const ToggleVisibility = () => {
	QUnit.module( 'ToggleVisibility', () => {
		QUnit.test( 'Simple', ( assert ) => {
			const eButton = ElementsHelper.createAutoButton(),
				done = assert.async();

			// TODO: Timeout & promising because of 'container.navView'.
			setTimeout( () => {
				$e.run( 'navigator/elements/toggle-visibility', {
					container: eButton,
				} );

				assert.equal( eButton.model.get( 'hidden' ), true );

				$e.run( 'navigator/elements/toggle-visibility', {
					container: eButton,
				} );

				assert.equal( eButton.model.get( 'hidden' ), false );

				done();
			} );
		} );
	} );
};

export default ToggleVisibility;
