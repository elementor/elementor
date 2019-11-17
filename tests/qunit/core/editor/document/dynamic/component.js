import DocumentHelper from '../helper';

QUnit.module( 'Component: document/dynamic', () => {
	QUnit.module( 'Single Selection', () => {
		QUnit.test( 'Settings', ( assert ) => {
			const eButton = DocumentHelper.createAutoButton(),
				dynamicTag = '[elementor-tag id="33e3c57" name="post-custom-field" settings="%7B%7D"]',
				dynamicValue = '{ dynamic text }',
				{ id, name, settings } = elementor.dynamicTags.tagTextToTagData( dynamicTag ),
				tag = elementor.dynamicTags.createTag( id, name, settings ),
				key = elementor.dynamicTags.createCacheKey( tag );

			// Set fake data.
			elementor.dynamicTags.cache[ key ] = dynamicValue;

			let done; // eslint-disable-line prefer-const

			eButton.view.attachElContent = function( html ) {
				eButton.view.$el.empty().append( html );

				done();

				assert.equal( eButton.view.$el.find( '.button-text' ).html(), dynamicValue,
					`button text changed to dynamic value: '${ dynamicValue }'` );
			};

			// TODO: Move to `DocumentHelper`.
			$e.run( 'document/dynamic/settings', {
				container: eButton,
				settings: { text: dynamicTag },
			} );

			done = assert.async();
		} );

		QUnit.test( 'Enable', ( assert ) => {
			const eButton = DocumentHelper.createAutoButton(),
				dynamicTag = '[elementor-tag id="33e3c57" name="post-custom-field" settings="%7B%7D"]',
				dynamicValue = '{ dynamic text }',
				{ id, name, settings } = elementor.dynamicTags.tagTextToTagData( dynamicTag ),
				tag = elementor.dynamicTags.createTag( id, name, settings ),
				key = elementor.dynamicTags.createCacheKey( tag );

			// Set fake data.
			elementor.dynamicTags.cache[ key ] = dynamicValue;

			let doneEnable; // eslint-disable-line prefer-const

			eButton.view.attachElContent = function( html ) {
				eButton.view.$el.empty().append( html );

				assert.equal( eButton.view.$el.find( '.button-text' ).html(), dynamicValue,
					`button text changed to dynamic value: '${ dynamicValue }'` );

				doneEnable();
			};

			$e.run( 'document/dynamic/enable', {
				container: eButton,
				settings: { text: dynamicTag },
			} );

			doneEnable = assert.async();
		} );

		QUnit.test( 'Disable', ( assert ) => {
			const eButton = DocumentHelper.createAutoButton(),
				eButtonText = eButton.settings.get( 'text' ),
				dynamicTag = '[elementor-tag id="33e3c57" name="post-custom-field" settings="%7B%7D"]',
				dynamicValue = '{ dynamic text }',
				{ id, name, settings } = elementor.dynamicTags.tagTextToTagData( dynamicTag ),
				tag = elementor.dynamicTags.createTag( id, name, settings ),
				key = elementor.dynamicTags.createCacheKey( tag );

			// Set fake data.
			elementor.dynamicTags.cache[ key ] = dynamicValue;

			let doneDisable; // eslint-disable-line prefer-const

			eButton.view.attachElContent = function( html ) {
				eButton.view.$el.empty().append( html );

				doneDisable();
			};

			$e.run( 'document/dynamic/enable', {
				container: eButton,
				settings: { text: dynamicTag },
			} );

			doneDisable = assert.async();

			// TODO: Move to `DocumentHelper`.
			$e.run( 'document/dynamic/disable', {
				container: eButton,
				settings: { text: dynamicTag },
			} );

			setTimeout( () => {
				assert.equal( eButton.view.$el.find( '.button-text' ).html(), eButtonText,
					`button text changed disabled to non-dynamic value: '${ eButtonText }'` );
			} );
		} );
	} );

	QUnit.module( 'Multiple Selection', () => {
		QUnit.test( 'Settings', ( assert ) => {
			const eButtons = DocumentHelper.multiCreateAutoButton(),
				dynamicTag = '[elementor-tag id="33e3c57" name="post-custom-field" settings="%7B%7D"]',
				dynamicValue = '{ dynamic text }',
				{ id, name, settings } = elementor.dynamicTags.tagTextToTagData( dynamicTag ),
				tag = elementor.dynamicTags.createTag( id, name, settings ),
				key = elementor.dynamicTags.createCacheKey( tag );

			// Set fake data.
			elementor.dynamicTags.cache[ key ] = dynamicValue;

			let done; // eslint-disable-line prefer-const

			eButtons.forEach( ( eButton ) => {
				eButton.view.attachElContent = function( html ) {
					eButton.view.$el.empty().append( html );

					if ( eButton === eButtons[ eButtons.length - 1 ] ) {
						done();
					}

					assert.equal( eButton.view.$el.find( '.button-text' ).html(), dynamicValue,
						`button with id: '${ eButton.id }' - text changed to dynamic value: '${ dynamicValue }'` );
				};
			} );

			// TODO: Move to `DocumentHelper`.
			$e.run( 'document/dynamic/settings', {
				containers: eButtons,
				settings: { text: dynamicTag },
			} );

			done = assert.async();
		} );
	} );
} );

