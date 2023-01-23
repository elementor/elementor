import ElementsHelper from '../helper';

export const Copy = () => {
	QUnit.module( 'Copy', () => {
		QUnit.test( 'Multiple Selection', ( assert ) => {
			const columnsCount = 2,
				eColumns = [];

			for ( let i = 0; i < columnsCount; i++ ) {
				eColumns.push( ElementsHelper.createWrappedButton() );
			}

			ElementsHelper.multiCopy( eColumns );

			const storage = elementorCommon.storage.get( 'clipboard' );

			assert.equal( storage.length, columnsCount, `'${ columnsCount }' elements were copied` );
		} );
	} );
};

export default Copy;
