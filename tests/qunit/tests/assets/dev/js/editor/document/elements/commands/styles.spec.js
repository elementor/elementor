import ElementsHelper from '../helper';
import HistoryHelper from '../../history/helper';

export const Settings = () => {
	QUnit.module( 'Styles', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButton = ElementsHelper.createWrappedButton(),
					id = 'abc';

				// Change button text.
				ElementsHelper.styles( eButton, [ { id } ] );

				const done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					// Check button text.
					assert.equal( eButton.model.get( 'styles' )[ 0 ].id, 'abc',
						`style array with 1 item of id: '${ id }'.` );

					done();
				} );
			} );

			QUnit.module( 'History', () => {
				QUnit.test( 'Simple', ( assert ) => {
					const eWidget = ElementsHelper.createWrappedButton(),
						defaultStyles = eWidget.model.get( 'styles' ),
						id = 'abc';

					// Change button text.
					ElementsHelper.styles( eWidget, { id } );

					const done = assert.async(); // Pause the test till done.

					setTimeout( () => {
						const historyItem = HistoryHelper.getFirstItem().attributes;

						// Exist in history.
						HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'Button' );

						// Undo.
						HistoryHelper.undoValidate( assert, historyItem );

						assert.equal( eWidget.model.get( 'styles' ), defaultStyles, 'Styles back to default' );

						// Redo.
						HistoryHelper.redoValidate( assert, historyItem );

						assert.equal( eWidget.model.get( 'styles' )[ 0 ].id, id, 'Styles restored' );

						done();
					} );
				} );
			} );
		} );
	} );
};

export default Settings;
