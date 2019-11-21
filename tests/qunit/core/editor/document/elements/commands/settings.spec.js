import DocumentHelper from '../../helper';
import HistoryHelper from '../../history/helper';

export const Settings = () => {
	QUnit.module( 'Settings', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButton = DocumentHelper.createAutoButton(),
					text = 'i test it';

				// Change button text.
				DocumentHelper.settings( eButton, { text } );

				const done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					// Check button text.
					assert.equal( eButton.settings.attributes.text, text,
						`text setting were changed to: '${ text }'.` );

					done();
				} );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eWidget = DocumentHelper.createAutoButton(),
					defaultText = eWidget.settings.attributes.text,
					text = 'i test it';

				// Change button text.
				DocumentHelper.settings( eWidget, { text } );

				const done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'Button' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					assert.equal( eWidget.settings.attributes.text, defaultText, 'Settings back to default' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					assert.equal( eWidget.settings.attributes.text, text, 'Settings restored' );

					done();
				} );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eSection1 = DocumentHelper.createSection(),
					eSection2 = DocumentHelper.createSection(),
					eColumns = DocumentHelper.multiCreateColumn( [ eSection1, eSection2 ] ),
					eButtons = DocumentHelper.multiCreateButton( eColumns ),
					text = 'i test it';

				DocumentHelper.multiSettings( eButtons, { text } );

				const done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					// Check button text.
					let count = 1;
					eButtons.forEach( ( eButton ) => {
						assert.equal( eButton.model.attributes.settings.attributes.text, text,
							`Button #${ count } text was changed to: '${ text }.'` );
						++count;
					} );

					done();
				} );
			} );

			QUnit.test( 'History', ( assert ) => {
				const eWidgets = DocumentHelper.multiCreateAutoButton(),
					text = 'i test it',
					defaultText = eWidgets[ 0 ].settings.attributes.text;

				// Change button text.
				DocumentHelper.multiSettings( eWidgets, { text } );

				const done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					const historyItem = elementor.history.history.getItems().at( 0 ).attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'elements' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					eWidgets.forEach( ( eWidget ) =>
						assert.equal( eWidget.settings.attributes.text, defaultText,
							'Settings back to default.' )
					);

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					eWidgets.forEach( ( eWidget ) =>
						assert.equal( eWidget.settings.attributes.text, text, 'Settings restored.' )
					);

					done();
				} );
			} );
		} );
	} );
};

export default Settings;
