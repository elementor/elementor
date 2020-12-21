import ElementsHelper from '../helper';
import HistoryHelper from '../../history/helper';

export const Settings = () => {
	QUnit.module( 'Settings', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButton = ElementsHelper.createAutoButton(),
					text = 'i test it';

				// Change button text.
				ElementsHelper.settings( eButton, { text } );

				const done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					// Check button text.
					assert.equal( eButton.settings.attributes.text, text,
						`text setting were changed to: '${ text }'.` );

					done();
				} );
			} );

			QUnit.module( 'History', () => {
				QUnit.test( 'Simple', ( assert ) => {
					const eWidget = ElementsHelper.createAutoButton(),
						defaultText = eWidget.settings.attributes.text,
						text = 'i test it';

					// Change button text.
					ElementsHelper.settings( eWidget, { text } );

					const done = assert.async(); // Pause the test till done.

					setTimeout( () => {
						const historyItem = HistoryHelper.getFirstItem().attributes;

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

				QUnit.test( 'Post Settings', ( assert ) => {
					const eDocument = elementor.getPreviewContainer(),
						settings = {
							padding: {
								top: '50',
							},
						};

					ElementsHelper.settings( eDocument, settings );

					const done = assert.async();

					setTimeout( () => {
						const historyItem = HistoryHelper.getFirstItem().attributes;

						// Exist in history.
						HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'Post' );

						// Undo.
						HistoryHelper.undoValidate( assert, historyItem );

						assert.equal( eDocument.settings.attributes.padding, undefined,
							'Settings back to default' );

						// Redo.
						HistoryHelper.redoValidate( assert, historyItem );

						assert.equal( eDocument.settings.attributes.padding.top, settings.padding.top,
							'Settings restored' );

						done();
					} );
				} );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eSection1 = ElementsHelper.createSection(),
					eSection2 = ElementsHelper.createSection(),
					eColumns = ElementsHelper.multiCreateColumn( [ eSection1, eSection2 ] ),
					eButtons = ElementsHelper.multiCreateButton( eColumns ),
					text = 'i test it';

				ElementsHelper.multiSettings( eButtons, { text } );

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
				const eWidgets = ElementsHelper.multiCreateAutoButton(),
					text = 'i test it',
					defaultText = eWidgets[ 0 ].settings.attributes.text;

				// Change button text.
				ElementsHelper.multiSettings( eWidgets, { text } );

				const done = assert.async(); // Pause the test till done.

				setTimeout( () => {
					const historyItem = HistoryHelper.getFirstItem().attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'Elements' );

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
