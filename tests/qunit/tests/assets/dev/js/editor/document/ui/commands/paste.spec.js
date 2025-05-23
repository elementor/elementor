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

const findChildrenContainer = ( parent, children ) => {
	if ( 0 === parent.model.attributes.elements.length ) {
		return false;
	}

	return parent.children.find( ( container ) => container.id === children.id );
};

const firstChildrenContainer = ( parent ) => {
	return parent.children[ 0 ];
};

const lastChildrenContainer = ( parent ) => {
	return parent.children[ parent.children.length - 1 ];
};

const validateRule = ( assert, target, targetElType, source, sourceElType, isAllowed ) => {
	let passed = false;

	const targetIsInner = target.model.get( 'isInner' ),
		sourceIsInner = source.model.get( 'isInner' );

	let isForce = false,
		copiedContainer = UIHelper.copyPaste( source, target ),
		message = `Copy: "${ sourceIsInner ? 'InnerSection::' : '' }${ sourceElType }"
		 And Paste to: "${ targetIsInner ? 'InnerSection::' : '' }${ targetElType }" "${ isAllowed ? 'ALLOW' : 'BLOCK' }"`;

	// Handle situation when source is inner.
	if ( sourceIsInner ) {
		if ( 'column' === sourceElType ) {
			source = source.children[ 0 ];
			sourceElType = 'column';
			isForce = true;
		} else {
			sourceElType = 'section';
		}
	}

	// Handle situation when target is inner.
	if ( targetIsInner ) {
		if ( 'column' === targetElType ) {
			target = target.children[ 0 ];
			targetElType = 'column';
			isForce = true;
		} else {
			targetElType = 'section';
		}
	}

	// When target or source is inner-section column, re-paste to the right depth.
	if ( isForce ) {
		copiedContainer = UIHelper.copyPaste( source, target );
	}

	// There is no point in checking what was not successful copied.
	if ( copiedContainer ) {
		switch ( targetElType ) {
			case 'document': {
				// Target is document.
				// Find source at document.
				let searchTarget = elementor.getPreviewContainer();

				if ( 'column' === sourceElType || ( elementorCommon.config.experimentalFeatures.container && 'widget' === sourceElType ) ) {
					const lastSection = lastChildrenContainer( searchTarget );

					searchTarget = lastSection;
				} else if ( 'widget' === sourceElType ) {
					const lastSection = lastChildrenContainer( searchTarget ),
						lastColumn = lastChildrenContainer( lastSection );

					searchTarget = lastColumn;
				}

				passed = !! findChildrenContainer( searchTarget, copiedContainer );
			}
			break;

			case 'section': {
				let searchTarget = target;

				if ( 'widget' === sourceElType && targetIsInner ) {
					const firstInnerSectionColumn = firstChildrenContainer( target );

					searchTarget = firstInnerSectionColumn;
				} else if ( 'widget' === sourceElType ) {
					searchTarget = lastChildrenContainer( target );
				} else if ( 'section' === sourceElType ) {
					searchTarget = target.parent;
				}

				passed = !! findChildrenContainer( searchTarget, copiedContainer );
			}
			break;

			case 'container': {
				passed = !! findChildrenContainer( target, copiedContainer );
			}
			break;

			case 'column': {
				let searchTarget = target;

				if ( 'column' === sourceElType ) {
					searchTarget = target.parent;
				}

				passed = !! findChildrenContainer( searchTarget, copiedContainer );
			}
			break;

			case 'widget': {
				passed = !! findChildrenContainer( target.parent, copiedContainer );
			}
			break;
		}
	}

	if ( copiedContainer ) {
		message += ' copy success';
	} else {
		message += ' copy failed';
	}

	if ( copiedContainer && isAllowed && passed ) {
		passed = true;
	} else if ( ! isAllowed && ! copiedContainer ) {
		passed = true;
	}

	// Check.
	assert.equal( passed, true, message );
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
