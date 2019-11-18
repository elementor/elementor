import { Empty as _Empty } from '../../../../../../../assets/dev/js/editor/document/elements/commands';
import DocumentHelper from '../../helper';

export const Empty = () => {
	QUnit.module( 'Empty', () => {
		QUnit.test( 'Single Selection', ( assert ) => {
			const eColumn = DocumentHelper.createSection( 1, true );

			DocumentHelper.createButton( eColumn );
			DocumentHelper.createButton( eColumn );

			// Ensure editor saver.
			elementor.saver.setFlagEditorChange( false );

			DocumentHelper.empty();

			// Check.
			assert.equal( elementor.getPreviewContainer().view.collection.length, 0,
				'all elements were removed.' );
			assert.equal( elementor.saver.isEditorChanged(), true, 'Command applied the saver editor is changed.' );
		} );

		QUnit.test( 'Restore()', ( assert ) => {
			const random = Math.random(),
				historyItem = {
					get: ( key ) => {
						if ( 'data' === key ) {
							return random;
						}
					},
				};

			let orig = $e.run,
				tempCommand = '',
				tempArgs = '';

			$e.run = ( command, args ) => {
				tempCommand = command;
				tempArgs = args;
			};

			// redo: `true`
			_Empty.restore( historyItem, true );

			$e.run = orig;

			assert.equal( tempCommand, 'document/elements/empty' );

			const addChildModelOrig = elementor.getPreviewView().addChildModel;

			// Clear.
			orig = $e.run;
			tempCommand = '';

			let tempData = '';

			elementor.getPreviewView().addChildModel = ( data ) => tempData = data;

			$e.run = ( command, args ) => {
				tempCommand = command;
			};

			// redo: `false`
			_Empty.restore( historyItem, false );

			$e.run = orig;

			elementor.getPreviewView().addChildModel = addChildModelOrig;

			assert.equal( tempData, random );
		} );
	} );
};

export default Empty;
