import CommonHelper from 'elementor/tests/qunit/tests/core/common/helper';
import ElementsHelper from '../../elements/helper';

export const Copy = () => {
	QUnit.test( 'Copy', ( assert ) => {
		elementorCommon.storage.set( 'clipboard', '' );

		const eButton = ElementsHelper.createAutoButton();

		CommonHelper.runShortcut( 67 /* c */, true );

		const done = assert.async();

		setTimeout( () => {
			// Check.
			const storage = elementorCommon.storage.get( 'clipboard' );

			assert.equal( eButton.id, storage[ 0 ].id, 'Element copied successfully' );

			done();
		} );
	} );
};

export default Copy;
