import ElementsHelper from '../helper';

export const Copy = () => {
	QUnit.module( 'Copy', () => {
		QUnit.test( 'Single Selection', ( assert ) => {
			const eColumn = ElementsHelper.createSection( 1, true ),
				eButton = ElementsHelper.createButton( eColumn );

			ElementsHelper.copy( eButton );

			const storage = elementorCommon.storage.get( 'clipboard' );

			assert.equal( eButton.id, storage[ 0 ].id, 'Element copied successfully' );
		} );

		QUnit.test( 'Multiple Selection', ( assert ) => {
			const columnsCount = 2,
				eColumns = [];

			for ( let i = 0; i < columnsCount; i++ ) {
				eColumns.push( ElementsHelper.createAutoButton() );
			}

			ElementsHelper.multiCopy( eColumns );

			const storage = elementorCommon.storage.get( 'clipboard' );

			assert.equal( storage.length, columnsCount, `'${ columnsCount }' elements were copied` );
		} );
	} );
};

export default Copy;
