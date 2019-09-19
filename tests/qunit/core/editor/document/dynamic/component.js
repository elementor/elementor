import Elements from '../helpers/elements';

QUnit.module( 'Component: document/dynamic', () => {
	QUnit.module( 'Single Selection', () => {
		QUnit.test( 'Settings', ( assert ) => {
			const eButton = Elements.createMockButtonWidget(),
				text = '[elementor-tag id="33e3c57" name="post-custom-field" settings="%7B%7D"]',
				dynamicValue = '{ dynamic text }',
				{ id, name, settings } = elementor.dynamicTags.tagTextToTagData( text ),
				tag = elementor.dynamicTags.createTag( id, name, settings ),
				key = elementor.dynamicTags.createCacheKey( tag );

			// Set fake data.
			elementor.dynamicTags.cache[ key ] = dynamicValue;

			let done;

			eButton.view.attachElContent = function( html ) {
				eButton.view.$el.empty().append( html );

				done();

				assert.equal( eButton.view.$el.find( '.button-text' ).html(), dynamicValue, `button text changed to dynamic value: '${ dynamicValue }'` );
			};

			$e.run( 'document/dynamic/settings', {
				container: eButton,
				settings: { text },
			} );

			done = assert.async();
		} );
	} );
} );


