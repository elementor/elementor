import DocumentHelper from '../../helper';

export const Copy = () => {
	QUnit.module( 'Copy', () => {
		QUnit.test( 'Single Selection', ( assert ) => {
			const eColumn = DocumentHelper.createSection( 1, true ),
				eButton = DocumentHelper.createButton( eColumn );

			DocumentHelper.copy( eButton );

			const storage = elementorCommon.storage.get( 'clipboard' );

			assert.equal( eButton.id, storage[ 0 ].id, 'Element copied successfully' );
		} );
	} );
};

export default Copy;
