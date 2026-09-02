import { isCompoundAtomicType } from 'elementor-editor/utils/element-types';

const makeConfig = ( types ) => {
	global.elementor = {
		getConfig: () => ( {
			elements: Object.fromEntries(
				types.map( ( [ type, isCompound ] ) => [ type, isCompound ? { is_compound: true } : {} ] )
			),
		} ),
	};
};

describe( 'isCompoundAtomicType', () => {
	beforeEach( () => {
		makeConfig( [
			[ 'e-tabs', true ],
			[ 'e-accordion', true ],
			[ 'e-collection-loop', true ],
			[ 'e-list', true ],
			[ 'e-form', true ],
			[ 'e-flexbox', false ],
			[ 'e-grid', false ],
			[ 'e-div-block', false ],
		] );
	} );

	test( 'returns true for compound atomic types', () => {
		expect( isCompoundAtomicType( 'e-tabs' ) ).toBe( true );
		expect( isCompoundAtomicType( 'e-accordion' ) ).toBe( true );
		expect( isCompoundAtomicType( 'e-collection-loop' ) ).toBe( true );
		expect( isCompoundAtomicType( 'e-list' ) ).toBe( true );
		expect( isCompoundAtomicType( 'e-form' ) ).toBe( true );
	} );

	test( 'returns false for generic container types', () => {
		expect( isCompoundAtomicType( 'e-flexbox' ) ).toBe( false );
		expect( isCompoundAtomicType( 'e-grid' ) ).toBe( false );
		expect( isCompoundAtomicType( 'e-div-block' ) ).toBe( false );
	} );

	test( 'returns false for legacy widget/section types', () => {
		expect( isCompoundAtomicType( 'widget' ) ).toBe( false );
		expect( isCompoundAtomicType( 'section' ) ).toBe( false );
		expect( isCompoundAtomicType( 'column' ) ).toBe( false );
	} );
} );
