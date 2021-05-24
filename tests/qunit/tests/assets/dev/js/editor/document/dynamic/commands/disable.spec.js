import ElementsHelper from '../../elements/helper';
import DynamicHelper from '../helper';

export const Disable = () => {
	QUnit.module( 'Disable', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButton = ElementsHelper.createAutoButton(),
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

				DynamicHelper.enable( eButton, {
					text: dynamicTag,
				} );

				doneDisable = assert.async();

				DynamicHelper.disable( eButton, {
					text: dynamicTag,
				} );

				setTimeout( () => {
					assert.equal( eButton.view.$el.find( '.button-text' ).html(), eButtonText,
						`button text changed disabled to non-dynamic value: '${ eButtonText }'` );
				} );
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButtons = ElementsHelper.multiCreateAutoButton(),
					eButtonText = eButtons[ 0 ].settings.get( 'text' ),
					dynamicTag = '[elementor-tag id="33e3c57" name="post-custom-field" settings="%7B%7D"]',
					dynamicValue = '{ dynamic text }',
					{ id, name, settings } = elementor.dynamicTags.tagTextToTagData( dynamicTag ),
					tag = elementor.dynamicTags.createTag( id, name, settings ),
					key = elementor.dynamicTags.createCacheKey( tag );

				// Set fake data.
				elementor.dynamicTags.cache[ key ] = dynamicValue;

				let doneDisable; // eslint-disable-line prefer-const

				eButtons.forEach( ( eButton ) => {
					eButton.view.attachElContent = function( html ) {
						eButton.view.$el.empty().append( html );

						if ( eButton === eButtons[ eButtons.length - 1 ] ) {
							doneDisable();
						}
					};
				} );

				DynamicHelper.multiEnable( eButtons, {
					text: dynamicTag,
				} );

				doneDisable = assert.async();

				DynamicHelper.multiDisable( eButtons, {
					text: dynamicTag,
				} );

				setTimeout( () => {
					eButtons.forEach( ( eButton ) => {
						assert.equal( eButton.view.$el.find( '.button-text' ).html(), eButtonText,
							`button with id: '${ eButton.id }' - button text changed disabled to non-dynamic value: '${ eButtonText }'` );
					} );
				} );
			} );
		} );
	} );
};

export default Disable;
