import DocumentHelper from '../../helper';

export const Duplicate = () => {
	QUnit.module( 'Duplicate', () => {
		QUnit.test( 'Single Selection', ( assert ) => {
			const eColumn = DocumentHelper.createSection( 1, true ),
				eButton = DocumentHelper.createButton( eColumn ),
				eButtonDuplicateCount = 2;

			for ( let i = 0; i < eButtonDuplicateCount; ++i ) {
				const eDuplicatedButton = DocumentHelper.duplicate( eButton );

				// Check if duplicated buttons have unique ids.
				assert.notEqual( eDuplicatedButton.id, eButton.id,
					`Duplicate button # ${ i + 1 } have unique id.` );
			}

			// Check duplicated button exist.
			assert.equal( eColumn.view.children.length, ( eButtonDuplicateCount + 1 ),
				`'${ eButtonDuplicateCount }' buttons were duplicated.` );
		} );

		QUnit.test( 'Multiple Selection', ( assert ) => {
			const eColumn1 = DocumentHelper.createSection( 1, true ),
				eColumn2 = DocumentHelper.createSection( 1, true ),
				eButtons = DocumentHelper.multiCreateButton( [ eColumn1, eColumn2 ] );

			DocumentHelper.multiDuplicate( eButtons );

			// Check duplicated button exist.
			assert.equal( eColumn1.view.children.length, 2, 'Two buttons were created.' );
			assert.equal( eColumn2.view.children.length, 2, 'Two buttons were duplicated.' );
		} );
	} );
};

export default Duplicate;
