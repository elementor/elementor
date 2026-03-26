import type { V1Element } from '@elementor/editor-elements';

import {
	clipboardRootsAreAtomicForms,
	FORM_ELEMENT_TYPE,
	movedContainersIncludeAtomicFormRoot,
} from '../utils';

function mockElement( widgetType?: string, elType?: string ): V1Element {
	return {
		model: {
			get: ( key: string ) => {
				if ( key === 'widgetType' ) {
					return widgetType;
				}
				if ( key === 'elType' ) {
					return elType;
				}
				return undefined;
			},
		},
	} as V1Element;
}

describe( 'form-structure utils', () => {
	describe( 'movedContainersIncludeAtomicFormRoot', () => {
		it( 'returns true when a top-level moved container is e-form', () => {
			const form = mockElement( undefined, FORM_ELEMENT_TYPE );

			expect( movedContainersIncludeAtomicFormRoot( [ form ] ) ).toBe( true );
		} );

		it( 'returns false when moved containers are only form fields', () => {
			const input = mockElement( 'e-form-input', 'widget' );

			expect( movedContainersIncludeAtomicFormRoot( [ input ] ) ).toBe( false );
		} );
	} );

	describe( 'clipboardRootsAreAtomicForms', () => {
		it( 'returns true when every root is e-form', () => {
			expect(
				clipboardRootsAreAtomicForms( [ { elType: FORM_ELEMENT_TYPE, elements: [] } ] )
			).toBe( true );
		} );

		it( 'returns false when a root is a bare form field', () => {
			expect(
				clipboardRootsAreAtomicForms( [ { widgetType: 'e-form-input', elements: [] } ] )
			).toBe( false );
		} );

		it( 'returns false for empty roots', () => {
			expect( clipboardRootsAreAtomicForms( [] ) ).toBe( false );
		} );
	} );
} );
