import DocumentHelper from '../../helper';
import CommonHelper from '../../../../common/helper';

export const Copy = () => {
	QUnit.test( 'Copy', ( assert ) => {
		const eButton = DocumentHelper.createAutoButton();

		CommonHelper.runShortcut( { which: 67 /* c */, ctrlKey: true, metaKey: true } );

		const done = assert.async();

		setTimeout( () => {
			// Check.
			const storage = elementorCommon.storage.get( 'clipboard' );

			assert.equal( eButton.id, storage[ 0 ].id, 'Element copied successfully' );

			done();
		}, 0 );
	} );
};

export default Copy;
