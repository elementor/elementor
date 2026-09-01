import { COMPOUND_ATOMIC_TYPES } from 'elementor-editor/utils/element-types';

describe( 'COMPOUND_ATOMIC_TYPES', () => {
	test( 'includes all expected compound atomic element types', () => {
		expect( COMPOUND_ATOMIC_TYPES ).toContain( 'e-tabs' );
		expect( COMPOUND_ATOMIC_TYPES ).toContain( 'e-accordion' );
		expect( COMPOUND_ATOMIC_TYPES ).toContain( 'e-collection-loop' );
		expect( COMPOUND_ATOMIC_TYPES ).toContain( 'e-list' );
		expect( COMPOUND_ATOMIC_TYPES ).toContain( 'e-form' );
	} );

	test( 'does not include generic container types', () => {
		expect( COMPOUND_ATOMIC_TYPES ).not.toContain( 'e-flexbox' );
		expect( COMPOUND_ATOMIC_TYPES ).not.toContain( 'e-grid' );
		expect( COMPOUND_ATOMIC_TYPES ).not.toContain( 'e-div-block' );
	} );

	test( 'does not include legacy widget/section types', () => {
		expect( COMPOUND_ATOMIC_TYPES ).not.toContain( 'widget' );
		expect( COMPOUND_ATOMIC_TYPES ).not.toContain( 'section' );
		expect( COMPOUND_ATOMIC_TYPES ).not.toContain( 'column' );
	} );
} );
