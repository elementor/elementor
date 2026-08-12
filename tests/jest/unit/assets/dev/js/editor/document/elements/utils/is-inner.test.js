import {
	isContainerElement,
	isInnerContainer,
	supportsNesting,
} from 'elementor/assets/dev/js/editor/document/elements/utils/is-inner';

describe( 'is-inner utilities', () => {
	beforeEach( () => {
		global.elementor = {
			widgetsCache: {
				'e-flexbox': {
					atomic: true,
					support_nesting: true,
				},
				'e-heading': {
					atomic: true,
					support_nesting: false,
				},
				'nested-tabs': {
					support_nesting: true,
				},
			},
		};
	} );

	afterEach( () => {
		delete global.elementor;
	} );

	test.each( [
		{ label: 'legacy container', model: { elType: 'container' } },
		{ label: 'V4 container', model: { elType: 'e-flexbox' } },
	] )( 'identifies a $label as a container element', ( { model } ) => {
		expect( isContainerElement( model ) ).toBe( true );
	} );

	test.each( [
		{ label: 'V4 leaf element', model: { elType: 'e-heading' } },
		{ label: 'V3 nested widget', model: { elType: 'widget', widgetType: 'nested-tabs' } },
		{ label: 'section', model: { elType: 'section' } },
	] )( 'does not identify a $label as a container element', ( { model } ) => {
		expect( isContainerElement( model ) ).toBe( false );
	} );

	test( 'identifies nesting support for widget models', () => {
		const model = {
			get: ( attribute ) => ( 'elType' === attribute ? 'widget' : 'nested-tabs' ),
		};

		expect( supportsNesting( model ) ).toBe( true );
	} );

	test.each( [
		{ label: 'legacy container', parentModel: { elType: 'container' }, expected: true },
		{ label: 'V4 container', parentModel: { elType: 'e-flexbox' }, expected: true },
		{ label: 'nested widget', parentModel: { elType: 'widget', widgetType: 'nested-tabs' }, expected: true },
		{ label: 'document', parentModel: { elType: 'document' }, expected: false },
		{ label: 'column', parentModel: { elType: 'column' }, expected: false },
	] )( 'derives isInner from a $label parent', ( { parentModel, expected } ) => {
		expect( isInnerContainer( parentModel ) ).toBe( expected );
	} );
} );
