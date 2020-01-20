import ElementsHelper from '../../elements/helper';
import HistoryHelper from '../../history/helper';
import BlockFaq from 'elementor/tests/qunit/mock/library/blocks/faq';
import PageLandingPageHotel from 'elementor/tests/qunit/mock/library/pages/landing-page-hotel';

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
				HistoryHelper.inHistoryValidate( assert, historyItem, 'add', 'template' );

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
					L1: 0,
					L2: 0,
					L3: 0,
				};

				// Deep Validation ( base on `data.content` & `elementor.elements` ).
				PageLandingPageHotel.content.forEach( ( section ) => {
					const _section = elementor.elements.at( count.L1 );

					assert.equal( _section.id, section.id, `Section L0#${ count.L1 } were created` );

					section.elements.forEach( ( column ) => {
						const _column = _section.get( 'elements' ).at( count.L2 );

						assert.equal( _column.id, column.id,
							`Column L1#${ count.L2 } were created` );

						column.elements.forEach( ( widget ) => {
							const _widget = _column.get( 'elements' ).at( count.L3 );

							assert.equal( _widget.id, widget.id, `Widget L3#${ count.L3 } were created` );

							count.L3++;
						} );

						count.L3 = 0;
						count.L2++;
					} );

					count.L2 = 0;
					count.L1++;
				} );
			} );
		} );

		// QUnit.test( 'Multiple Selection', ( assert ) => {
		//
		// } );
	} );
};

export default Import;
