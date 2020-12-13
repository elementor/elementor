import ElementsHelper from '../../elements/helper';
import DynamicHelper from '../helper';

export const Enable = () => {
	QUnit.module( 'Enable', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButton = ElementsHelper.createAutoButton(),
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

				DynamicHelper.enable( eButton, {
					text: dynamicTag,
				} );

				doneEnable = assert.async();
			} );
		} );

		QUnit.module( 'Multiple Selection', () => {
			QUnit.test( 'Simple', ( assert ) => {
				const eButtons = ElementsHelper.multiCreateAutoButton(),
					dynamicTag = '[elementor-tag id="33e3c57" name="post-custom-field" settings="%7B%7D"]',
					dynamicValue = '{ dynamic text }',
					{ id, name, settings } = elementor.dynamicTags.tagTextToTagData( dynamicTag ),
					tag = elementor.dynamicTags.createTag( id, name, settings ),
					key = elementor.dynamicTags.createCacheKey( tag );

				// Set fake data.
				elementor.dynamicTags.cache[ key ] = dynamicValue;

				let doneEnable; // eslint-disable-line prefer-const

				eButtons.forEach( ( eButton ) => {
					eButton.view.attachElContent = function( html ) {
						eButton.view.$el.empty().append( html );

						assert.equal( eButton.view.$el.find( '.button-text' ).html(), dynamicValue,
							`button with id: '${ eButton.id }' - button text changed to dynamic value: '${ dynamicValue }'` );

						if ( eButton === eButtons[ eButtons.length - 1 ] ) {
							doneEnable();
						}
					};
				} );

				DynamicHelper.multiEnable( eButtons, {
					text: dynamicTag,
				} );

				doneEnable = assert.async();
			} );
		} );
	} );
};

export default Enable;
