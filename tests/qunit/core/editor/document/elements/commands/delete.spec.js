import DocumentHelper from '../../helper';
import HistoryHelper from '../../history/helper';

export const Delete = () => {
	QUnit.module( 'Delete', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
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

			QUnit.test( 'History', ( assert ) => {
				const eWidget = DocumentHelper.createAutoButton();

				DocumentHelper.delete( eWidget );

				const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'remove', 'Button' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Element exist again.
				HistoryHelper.recreatedValidate( assert, eWidget );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Element Does not exist.
				HistoryHelper.destroyedValidate( assert, eWidget );
			} );
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
