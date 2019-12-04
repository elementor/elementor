import HistoryHelper from '../../history/helper';
import ElementsHelper from '../../elements/helper';
import DynamicHelper from '../helper';

export const Settings = () => {
	QUnit.module( 'Settings', () => {
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

				let done; // eslint-disable-line prefer-const

				eButton.view.attachElContent = function( html ) {
					eButton.view.$el.empty().append( html );

					done();

					assert.equal( eButton.view.$el.find( '.button-text' ).html(), dynamicValue,
						`button text changed to dynamic value: '${ dynamicValue }'` );
				};

				DynamicHelper.settings( eButton, {
					text: dynamicTag,
				} );

				done = assert.async();
			} );

			QUnit.test( 'History', ( assert ) => {
				const eButton = ElementsHelper.createAutoButton(),
					defaultButtonText = eButton.settings.attributes.text,
					text = '[elementor-tag id="33e3c57" name="post-custom-field" settings="%7B%7D"]',
					dynamicValue = '{ dynamic text }',
					{ id, name, settings } = elementor.dynamicTags.tagTextToTagData( text ),
					tag = elementor.dynamicTags.createTag( id, name, settings ),
					key = elementor.dynamicTags.createCacheKey( tag );

				// Set fake data.
				elementor.dynamicTags.cache[ key ] = dynamicValue;

				eButton.view.attachElContent = function( html ) {
					eButton.view.$el.empty().append( html );
				};

				DynamicHelper.settings( eButton, { text } );

				const doneSettings = assert.async();

				setTimeout( () => {
					const historyItem = HistoryHelper.getFirstItem().attributes;

					// Exist in history.
					HistoryHelper.inHistoryValidate( assert, historyItem, 'change', 'Button' );

					// Undo.
					HistoryHelper.undoValidate( assert, historyItem );

					assert.equal( eButton.settings.attributes.text, defaultButtonText, 'Settings back to default' );

					// Redo.
					HistoryHelper.redoValidate( assert, historyItem );

					doneSettings();

					const doneDynamic = assert.async();

					setTimeout( () => {
						assert.equal( eButton.view.$el.find( '.button-text' ).html(), dynamicValue, 'Settings restored' );
						doneDynamic();
					}, 1000 );
				} );
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

				DynamicHelper.multiSettings( eButtons, {
					text: dynamicTag,
				} );

				done = assert.async();
			} );
		} );
	} );
};

export default Settings;
