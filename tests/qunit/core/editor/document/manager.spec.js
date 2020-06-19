import ElementsHelper from './elements/helper.js';

let documentTemp;

jQuery( () => {
	QUnit.module( 'File: editor/document/manager', ( hooks ) => {
		hooks.before( () => {
			// Save current document before go.
			documentTemp = elementor.documents.getCurrent();
		} );

		hooks.after( () => {
			// Put back saved document, to current.
			elementor.documents.setCurrent( documentTemp );
		} );

		QUnit.test( 'History per document', ( assert ) => {
			const documentConfigFoo = { id: 2 },
				documentConfigBar = { id: 3 };

			// Add fake documents.
			const documentFoo = elementor.documents.addDocumentByConfig( documentConfigFoo ),
				documentBar = elementor.documents.addDocumentByConfig( documentConfigBar );

			// Set current document to Foo.
			elementor.documents.setCurrent( documentFoo );

			// Create button and save it under Foo document.
			const eButton = ElementsHelper.createAutoButton();

			// Validate the button was saved to history of Foo document.
			assert.equal( elementor.documents.getCurrent().history.getItems().length, 3,
				'Foo document have "3" items in history.' );

			// Set current document to Bar.
			elementor.documents.setCurrent( documentBar );

			// Validate document does not have History.
			assert.equal( elementor.documents.getCurrent().history.getItems().length, 0,
				'Bar document does not have items in history.' );

			// Do change under Bar document.
			ElementsHelper.settings( eButton, {
				text: 'Some other value',
			} );

			const done = assert.async(); // Pause the test till done.

			setTimeout( () => {
				// Validate history of Bar document was affected.
				assert.equal( elementor.documents.getCurrent().history.getItems().length, 2,
					'Bar document have "2" items in history.' );

				// Ensure history under Bar document have button settings changed.
				assert.equal( elementor.documents.getCurrent().history.getItems().at( 0 ).attributes.type, 'change',
					'Bar document was affected and there is "change" type in it.' );

				// Set current document to Foo.
				elementor.documents.setCurrent( documentFoo );

				// Ensure Foo still have only initial history.
				assert.equal( elementor.documents.getCurrent().history.getItems().length, 3,
					'Foo document still have "3" items in history.' );

				done();
			} );
		} );
	} );
} );
