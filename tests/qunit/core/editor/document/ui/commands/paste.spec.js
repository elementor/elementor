import DocumentHelper from '../../helper';
import ElementsHelper from '../../elements/helper';

export const DEFAULT_PASTE_RULES = {
	section: {
		document: true,
		section: true,
		column: false,
		widget: false,
		innerSection: {
			section: false,
			column: false,
		},
	},

	column: {
		document: true,
		section: true,
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
		column: true,
		widget: false,
		innerSection: {
			section: true,
			column: false,
		},
	},
};

const validateType = ( assert, target, targetElType, source, sourceElType, isAllowed, copiedSuccess = false ) => {
	let passed = false;

	const targetIsInner = target.model.get( 'isInner' ),
		sourceIsInner = source.model.get( 'isInner' );

	switch ( targetElType ) {
		case 'document': {
			passed = 2 === elementor.elements.length;
		}
		break;

		case 'section': {
			if ( targetIsInner && 'column' === sourceElType ) {
				passed = 3 === target.view.children.length;
			} else if ( 'section' === sourceElType ) {
				passed = 3 === elementor.elements.length;
			} else if ( 'column' === sourceElType ) {
				passed = 2 === target.view.children.length;
			} else if ( 'innerSection' === sourceElType || 'widget' === sourceElType ) {
				passed = 1 === target.view.children.findByIndex( 0 ).children.length;
			}
		}
		break;

		case 'column': {
			if ( sourceIsInner && 'innerSection' === sourceElType ) {
				passed = 2 === target.view.children.findByIndex( 0 ).children.length;
			} else if ( targetIsInner && 'column' === sourceElType ) {
				passed = 3 === target.view.children.length;
			} else if ( targetIsInner && 'widget' === sourceElType ) {
				passed = 'widget' ===
					target.view.children.findByIndex( 0 ).children.findByIndex( 0 ).model.get( 'elType' );
			} else if ( 'column' === sourceElType ) {
				passed = 2 === target.parent.view.children.length;
			} else if ( 'widget' === sourceElType ) {
				passed = 1 === target.view.children.length;
			}
		}
		break;

		case 'widget': {
			if ( 'widget' === sourceElType ) {
				passed = 2 === target.parent.view.children.length;
			}
		}
		break;
	}

	// Check.
	assert.equal( copiedSuccess && passed, isAllowed,
		`Copy: "${ sourceIsInner ? 'InnerSection::' : '' }${ sourceElType }"
		 And Paste to: "${ targetIsInner ? 'InnerSection::' : '' }${ targetElType }" "${ isAllowed ? 'ALLOW' : 'BLOCK' }"` );
};

export const Paste = () => {
	QUnit.module( 'Paste', () => {
		QUnit.module( 'Single Selection', ( hooks ) => {
			hooks.beforeEach = () => {
				elementorCommon.storage.set( 'clipboard', '' );
			};

			QUnit.test( 'Simple', ( assert ) => {
				const eColumn = ElementsHelper.createSection( 1, true ),
					eButton = ElementsHelper.createButton( eColumn );

				DocumentHelper.UICopyPaste( eButton, eColumn );

				// Check.
				assert.equal( eColumn.view.children.length, 2,
					'Pasted element were created.' );
			} );

			QUnit.test( 'Rules', ( assert ) => {
				Object.keys( DEFAULT_PASTE_RULES ).forEach( ( sourceElType ) => {
					Object.entries( DEFAULT_PASTE_RULES[ sourceElType ] ).forEach( ( [ targetElType, isAllowed ] ) => {
						ElementsHelper.empty();

						const source = DocumentHelper.autoCreate( sourceElType ),
							target = DocumentHelper.autoCreate( targetElType ),
							copiedSuccess = DocumentHelper.UICopyPaste( source, target );

						if ( 'object' === typeof isAllowed ) {
							Object.keys( isAllowed ).some( ( _targetElType ) => {
								validateType( assert,
									target,
									_targetElType,
									source,
									sourceElType,
									isAllowed[ _targetElType ],
									copiedSuccess,
									true
								);
							} );

							return;
						}

						validateType( assert, target, targetElType, source, sourceElType, isAllowed, copiedSuccess );
					} );
				} );
			} );
		} );
	} );
};

export default Paste;
