import DocumentHelper from '../../helper';

export const Delete = () => {
	QUnit.module( 'Delete', () => {
		QUnit.test( 'Single Selection', ( assert ) => {
			const eColumn = DocumentHelper.createSection( 1, true ),
				eButton1 = DocumentHelper.createButton( eColumn ),
				eButton2 = DocumentHelper.createButton( eColumn );

			DocumentHelper.delete( eButton1 );

			// Validate.
			assert.equal( eColumn.view.collection.length, 1, 'Button #1 were deleted.' );

			// Ensure editor saver.
			elementor.saver.setFlagEditorChange( false );

			DocumentHelper.delete( eButton2 );

			// Validate.
			assert.equal( eColumn.view.collection.length, 0, 'Button #2 were deleted.' );

			assert.equal( elementor.saver.isEditorChanged(), true,
				'Command applied the saver editor is changed.' );
		} );

		QUnit.test( 'Multiple Selection', ( assert ) => {
			const eColumn = DocumentHelper.createSection( 1, true ),
				eButton1 = DocumentHelper.createButton( eColumn ),
				eButton2 = DocumentHelper.createButton( eColumn );

			DocumentHelper.multiDelete( [ eButton1, eButton2 ] );

			// Validate.
			assert.equal( eColumn.view.collection.length, 0, 'Buttons were deleted.' );
		} );
	} );
};

export default Delete;
