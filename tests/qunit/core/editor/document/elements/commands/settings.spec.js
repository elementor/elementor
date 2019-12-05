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

			QUnit.module( 'History', () => {
				QUnit.test( 'Simple', ( assert ) => {
					const eWidget = DocumentHelper.createAutoButton(),
						defaultText = eWidget.settings.attributes.text,
						text = 'i test it';

					// Change button text.
					DocumentHelper.settings( eWidget, { text } );

					const done = assert.async(); // Pause the test till done.

					setTimeout( () => {
						const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

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

					DocumentHelper.settings( eDocument, settings );

					const done = assert.async();

					setTimeout( () => {
						const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

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

				QUnit.test( 'General Settings: Style', ( assert ) => {
					elementor.getPreviewView();

					const eGeneralSettings = elementor.settings.general.getEditedView().getContainer(),
						settings = {
							elementor_default_generic_fonts: 'fake',
						};

					DocumentHelper.settings( eGeneralSettings, settings );

					const done = assert.async();

					setTimeout( () => {
						const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

						// Exist in history.
						HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'Global Settings' );

						// Undo.
						HistoryHelper.undoValidate( assert, historyItem );

						assert.equal( eGeneralSettings.settings.attributes.elementor_default_generic_fonts,
							elementor.config.settings.general.settings.elementor_default_generic_fonts,
							'Settings back to default' );

						// Redo.
						HistoryHelper.redoValidate( assert, historyItem );

						assert.equal( eGeneralSettings.settings.attributes.elementor_default_generic_fonts,
							settings.elementor_default_generic_fonts,
							'Settings restored'
						);

						done();
					} );
				} );

				QUnit.test( 'General Settings: Lightbox', ( assert ) => {
					elementor.getPreviewView();

					const eGeneralSettings = elementor.settings.general.getEditedView().getContainer(),
						settings = {
							elementor_global_image_lightbox: 'fake',
						};

					DocumentHelper.settings( eGeneralSettings, settings );

					const done = assert.async();

					setTimeout( () => {
						const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

						// Exist in history.
						HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'Global Settings' );

						// Undo.
						HistoryHelper.undoValidate( assert, historyItem );

						assert.equal( eGeneralSettings.settings.attributes.elementor_global_image_lightbox,
							elementor.config.settings.general.settings.elementor_global_image_lightbox,
							'Settings back to default' );

						// Redo.
						HistoryHelper.redoValidate( assert, historyItem );

						assert.equal( eGeneralSettings.settings.attributes.elementor_global_image_lightbox,
							settings.elementor_global_image_lightbox,
							'Settings restored'
						);

						done();
					} );
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
					const historyItem = elementor.documents.getCurrent().history.getItems().at( 0 ).attributes;

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
