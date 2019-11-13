jQuery( () => {
	QUnit.module( 'File: editor/container/container.js', () => {
		QUnit.module( 'Container', () => {
			QUnit.test( 'constructor()', ( assert ) => {
				const fakeArgs = {
						type: 'fake',
						id: 'fake',
						settings: new Backbone.Model(),
						model: new Backbone.Model(),
						label: 'Fake Label',
					},
					container = new elementorModules.editor.Container( fakeArgs );

				assert.equal( !! container, true, );
			} );

			QUnit.test( 'constructor(): without args', ( assert ) => {
				assert.throws(
					() => {
						new elementorModules.editor.Container( { } );
					},
					new Error( 'type is required.' ),
				);
			} );
		} );
	} );
} );

