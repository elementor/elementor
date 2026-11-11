import { stripOrphanMarkers } from '../strip-orphan-markers';

describe( 'stripOrphanMarkers', () => {
	it( 'removes part, slot and the lock that came with the part, recursively', () => {
		// Arrange.
		const model = {
			elType: 'e-flexbox',
			part: 'feature',
			slot: true,
			isLocked: true,
			elements: [ { elType: 'widget', widgetType: 'e-heading', part: 'feature_text', isLocked: true } ],
		};

		// Act.
		const result = stripOrphanMarkers( model );

		// Assert.
		expect( result ).toEqual( {
			elType: 'e-flexbox',
			elements: [ { elType: 'widget', widgetType: 'e-heading' } ],
		} );
	} );

	it( 'keeps a lock that did not come with a part', () => {
		// Arrange.
		const model = { elType: 'e-tab', isLocked: true, elements: [ { elType: 'e-flexbox', part: 'stray' } ] };

		// Act.
		const result = stripOrphanMarkers( model );

		// Assert.
		expect( result ).toEqual( { elType: 'e-tab', isLocked: true, elements: [ { elType: 'e-flexbox' } ] } );
	} );

	it( 'leaves a widget root and everything below it untouched', () => {
		// Arrange.
		const nestedWidget = {
			elType: 'e-flexbox',
			part: 'root',
			widget: { id: 'elementor/icon-button', version: 1 },
			elements: [ { elType: 'widget', widgetType: 'e-svg', part: 'icon', isLocked: true } ],
		};
		const model = { elType: 'e-flexbox', elements: [ nestedWidget ] };

		// Act.
		const result = stripOrphanMarkers( model );

		// Assert.
		expect( result ).toBe( model );
	} );
} );
