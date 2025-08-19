import UIHelper from 'elementor/tests/qunit/tests/assets/dev/js/editor/document/ui/helper';
import ElementsHelper from '../../elements/helper';

/**
 * TODO: Refactor whole file.
 *
 * Example usage:
 *
 * copySource: {
 *     pasteTarget: true|false, ( true -> Copy allowed, false -> Copy not allowed )
 * }
 */
export const DEFAULT_PASTE_RULES = {
	section: {
		document: true,
		section: true,
		container: false,
		column: false,
		widget: false,
		innerSection: {
			section: false,
			column: false,
		},
	},

	container: {
		document: true,
		section: false,
		container: true,
		column: true,
		widget: false,
		innerSection: {
			section: false,
			column: true,
		},
	},

	column: {
		document: true,
		section: true,
		container: false,
		column: true,
		widget: false,
		innerSection: {
			section: true,
			column: true,
		},
	},

	widget: {
		document: true,
		section: true,
		container: true,
		column: true,
		widget: true,
		innerSection: {
			section: true,
			column: true,
		},
	},

	innerSection: {
		document: true,
		section: false,
		container: false,
		column: true,
		widget: false,
		innerSection: {
			section: true,
			column: false,
		},
	},
};

export const Paste = () => {
	QUnit.module( 'Paste', () => {
		QUnit.module( 'Single Selection', ( hooks ) => {
			hooks.beforeEach = () => {
				ElementsHelper.empty();

				elementorCommon.storage.set( 'clipboard', '' );
			};

			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eButton = ElementsHelper.createWidgetButton( eColumn );

				UIHelper.copyPaste( eButton, eColumn );

				// Check.
				assert.equal( eColumn.children.length, 2,
					'Pasted element were created.' );
			} );

			QUnit.module( 'Positions', () => {
				QUnit.test( 'Section => Section', ( assert ) => {
					const source = ElementsHelper.createAuto( 'section' );

					// To make it more complex.
					ElementsHelper.createAuto( 'section' );

					const target = ElementsHelper.createAuto( 'section' ),
						copiedSuccess = !! UIHelper.copyPaste( source, target );

					assert.equal( copiedSuccess, true, 'Element were pasted.' );

					const elements = elementor.getPreviewContainer().model.get( 'elements' ),
						sourcePos = elements.findIndex( source.model ),
						targetPos = elements.findIndex( target.model );

					assert.equal( sourcePos + 2, targetPos,
						'Element were pasted at the correct location.' );
				} );

				QUnit.test( 'Column => Column', ( assert ) => {
					const source = ElementsHelper.createAuto( 'column' );

					// To make it more complex.
					ElementsHelper.createAuto( 'section' );

					const target = ElementsHelper.createAuto( 'column' ),
						copiedSuccess = !! UIHelper.copyPaste( source, target );

					assert.equal( copiedSuccess, true, 'Element were pasted.' );

					const elements = elementor.getPreviewContainer().model.get( 'elements' ),
						sourcePos = elements.findIndex( source.parent.model ),
						targetPos = elements.findIndex( target.parent.model );

					assert.equal( sourcePos + 2, targetPos,
						'Element were pasted at the correct location.' );
				} );

				QUnit.test( 'Widget => Widget', ( assert ) => {
					const source = ElementsHelper.createAuto( 'widget' );

					// To make it more complex.
					ElementsHelper.createAuto( 'section' );

					const target = ElementsHelper.createAuto( 'widget' ),
						copiedSuccess = !! UIHelper.copyPaste( source, target );

					assert.equal( copiedSuccess, true, 'Element were pasted.' );

					const elements = elementor.getPreviewContainer().model.get( 'elements' ),
						sourcePos = elements.findIndex( source.parent.parent.model ),
						targetPos = elements.findIndex( target.parent.parent.model );

					assert.equal( sourcePos + 2, targetPos,
						'Element were pasted at the correct location.' );
				} );
			} );
		} );
	} );
};

export default Paste;
