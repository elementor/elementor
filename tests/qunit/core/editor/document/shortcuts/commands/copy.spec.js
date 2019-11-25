import DocumentHelper from '../../helper';
import CommonHelper from '../../../../common/helper';

export const Copy = () => {
	QUnit.test( 'Copy', ( assert ) => {
		elementorCommon.storage.set( 'clipboard', '' );

		const eButton = DocumentHelper.createAutoButton();

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
