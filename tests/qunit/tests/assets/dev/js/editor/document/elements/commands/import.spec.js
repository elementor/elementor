import ElementsHelper from '../helper';
import HistoryHelper from '../../history/helper';
import BlockFaq from 'elementor/tests/qunit/mock/library/blocks/faq.json';
import PageLandingPageHotel from 'elementor/tests/qunit/mock/library/pages/landing-page-hotel.json';

export const Import = () => {
	QUnit.module( 'Import', () => {
		QUnit.module( 'Single Selection', () => {
			QUnit.test( 'History', ( assert ) => {
				// eslint-disable-next-line camelcase
				const { model, content, page_settings } = BlockFaq,
					data = { content, page_settings };

				ElementsHelper.import( data, new Backbone.Model( model ) );

				const historyItem = HistoryHelper.getFirstItem().attributes;

				// Exist in history.
				HistoryHelper.inHistoryValidate( assert, historyItem, 'add', 'Template' );

				// Undo.
				HistoryHelper.undoValidate( assert, historyItem );

				// Check items were removed.
				assert.equal( elementor.elements.length, 0, 'Template were removed.' );

				// Redo.
				HistoryHelper.redoValidate( assert, historyItem );
			} );

			QUnit.test( 'Validate positions', ( assert ) => {
				// eslint-disable-next-line camelcase
				const { model, content, page_settings } = BlockFaq,
					data = { content, page_settings },
					importPosition = 1;

				// Create sections as separators ( index 0, 1, 2 ).
				ElementsHelper.createSection( 1 );
				ElementsHelper.createSection( 1 );
				ElementsHelper.createSection( 1 );

				// Import new block between the the first section and second.
				const imported = ElementsHelper.import( data, new Backbone.Model( model ), { at: importPosition } );

				// Validate imported block is in the right position.
				assert.equal( elementor.getPreviewContainer().model.get( 'elements' ).findIndex( imported[ 0 ].model ),
					importPosition );
			} );

			QUnit.test( 'Deep validation', ( assert ) => {
				// Covers issue 'template inserted upside down'.
				ElementsHelper.import( BlockFaq, new Backbone.Model( BlockFaq.model ) );
				ElementsHelper.import( PageLandingPageHotel,
					new Backbone.Model( PageLandingPageHotel.model ),
					{ at: 0 }
				);

				// Level depth.
				const count = {
					level1: 0,
					level2: 0,
					level3: 0,
				};

				// Deep Validation ( base on `data.content` & `elementor.elements` ).
				PageLandingPageHotel.content.forEach( ( section ) => {
					const _section = elementor.elements.at( count.level1 );

					assert.equal( _section.id, section.id, `Section level0 #${ count.level1 } were created` );

					section.elements.forEach( ( column ) => {
						const _column = _section.get( 'elements' ).at( count.level2 );

						assert.equal( _column.id, column.id,
							`Column level1 #${ count.level2 } were created` );

						column.elements.forEach( ( widget ) => {
							const _widget = _column.get( 'elements' ).at( count.level3 );

							assert.equal( _widget.id, widget.id, `Widget level3 #${ count.level3 } were created` );

							count.level3++;
						} );

						count.level3 = 0;
						count.level2++;
					} );

					count.level2 = 0;
					count.level1++;
				} );
			} );
		} );

		// QUnit.test( 'Multiple Selection', ( assert ) => {
		//
		// } );
	} );
};

export default Import;
