import DocumentHelper from '../../helper';
import HistoryHelper from '../../history/helper';

// TODO: Check code coverage and add required tests.
export const Paste = () => {
	QUnit.module( 'Paste', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eButton = DocumentHelper.createButton( eColumn );

				DocumentHelper.copy( eButton );

				// Ensure editor saver.
				elementor.saver.setFlagEditorChange( false );

				DocumentHelper.paste( eColumn );

				// Check.
				assert.equal( elementor.elements.at( 0 ).get( 'elements' ).at( 0 ).get( 'elements' ).length, 2,
					'Pasted element were created.' );
				assert.equal( elementor.saver.isEditorChanged(), true,
					'Command applied the saver editor is changed.' );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eWidget = DocumentHelper.createButton( eColumn );

				DocumentHelper.copy( eWidget );

				const ePastedWidget = DocumentHelper.paste( eColumn ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'paste', 'elements' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Element Does not exist.
				HistoryHelper.destroyedValidate( assert, ePastedWidget );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Element exist again.
				HistoryHelper.recreatedValidate( assert, ePastedWidget );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eSection1 = DocumentHelper.createSection(),
					eSection2 = DocumentHelper.createSection(),
					eColumns = DocumentHelper.multiCreateColumn( [ eSection1, eSection2 ] ),
					eButtons = DocumentHelper.multiCreateButton( eColumns );

				DocumentHelper.copy( eButtons[ 0 ] );

				DocumentHelper.multiPaste( eColumns );

				// Check pasted button exist.
				let count = 1;
				eColumns.forEach( ( eColumn ) => {
					assert.equal( eColumn.view.children.length, 2,
						`Button #${ count } were pasted.` );
					++count;
				} );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eColumn = DocumentHelper.createSection( 1, true ),
					eWidget = DocumentHelper.createButton( eColumn );

				DocumentHelper.copy( eWidget );

				const ePastedWidget = DocumentHelper.paste( eColumn ),
					historyItem = elementor.history.history.getItems().at( 0 ).attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'paste', 'elements' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Element Does not exist.
				HistoryHelper.destroyedValidate( assert, ePastedWidget );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );

				// Element exist again.
				HistoryHelper.recreatedValidate( assert, ePastedWidget );
			} );
		} );
	} );
};

export default Paste;
