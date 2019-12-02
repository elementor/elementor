import DocumentHelper from '../../helper';

export const Disable = () => {
	QUnit.module( 'Disable', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
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

		// QUnit.module( 'Multiple Selection', () => {
		//
		// } );
	} );
};

export default Disable;
