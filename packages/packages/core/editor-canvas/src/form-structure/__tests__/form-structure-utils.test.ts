import type { V1Element } from '@elementor/editor-elements';

import { parseXml } from '../../__tests__/parse-xml';
import {
	clipboardRootsAreAtomicForms,
	collectEmptyMessageErrors,
	collectFormAncestorErrors,
	collectSubmitButtonErrors,
	FORM_ELEMENT_TYPE,
	getClipboardElementType,
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
	describe( 'getClipboardElementType', () => {
		it( 'prefers widgetType over elType', () => {
			expect( getClipboardElementType( { widgetType: 'e-form-input', elType: 'widget' } ) ).toBe(
				'e-form-input'
			);
		} );

		it( 'falls back to elType', () => {
			expect( getClipboardElementType( { elType: FORM_ELEMENT_TYPE } ) ).toBe( FORM_ELEMENT_TYPE );
		} );

		it( 'returns undefined when absent', () => {
			expect( getClipboardElementType( {} ) ).toBeUndefined();
		} );
	} );

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
			expect( clipboardRootsAreAtomicForms( [ { elType: FORM_ELEMENT_TYPE, elements: [] } ] ) ).toBe( true );
		} );

		it( 'returns false when a root is a bare form field', () => {
			expect( clipboardRootsAreAtomicForms( [ { widgetType: 'e-form-input', elements: [] } ] ) ).toBe( false );
		} );

		it( 'returns false for empty roots', () => {
			expect( clipboardRootsAreAtomicForms( [] ) ).toBe( false );
		} );
	} );

	describe( 'collectFormAncestorErrors', () => {
		it( 'returns no errors when form field is a direct child of e-form', () => {
			const xml = parseXml( `
				<e-form>
					<e-form-input />
				</e-form>
			` );
			expect( collectFormAncestorErrors( xml ) ).toHaveLength( 0 );
		} );
		it( 'returns no errors when form field is a deep descendant of e-form (valid)', () => {
			const xml = parseXml( `
				<e-form>
					<e-flexbox>
						<e-form-input />
					</e-flexbox>
				</e-form>
			` );
			expect( collectFormAncestorErrors( xml ) ).toHaveLength( 0 );
		} );
		it( 'returns no errors when e-form wraps multiple containers with fields (valid)', () => {
			const xml = parseXml( `
				<e-flexbox>
					<e-form>
						<e-form-input />
					</e-form>
				</e-flexbox>
			` );
			expect( collectFormAncestorErrors( xml ) ).toHaveLength( 0 );
		} );
		it( 'returns an error when form field has no e-form ancestor (invalid)', () => {
			const xml = parseXml( `
				<e-flexbox>
					<e-flexbox>
						<e-form-input />
					</e-flexbox>
				</e-flexbox>
			` );
			const errors = collectFormAncestorErrors( xml );
			expect( errors ).toHaveLength( 1 );
			expect( errors[ 0 ] ).toContain( 'e-form-input' );
			expect( errors[ 0 ] ).toContain( 'e-form' );
		} );
		it( 'returns an error for each orphaned form field', () => {
			const xml = parseXml( `
				<e-flexbox>
					<e-form-input />
					<e-form-label />
				</e-flexbox>
			` );
			expect( collectFormAncestorErrors( xml ) ).toHaveLength( 2 );
		} );
		it( 'includes configuration-id in the error message when present', () => {
			const xml = parseXml( `
				<e-flexbox>
					<e-form-input configuration-id="my-input" />
				</e-flexbox>
			` );
			const errors = collectFormAncestorErrors( xml );
			expect( errors[ 0 ] ).toContain( 'configuration-id="my-input"' );
		} );
		it( 'returns no errors when there are no form fields at all', () => {
			const xml = parseXml( `
				<e-flexbox>
					<e-heading />
				</e-flexbox>
			` );
			expect( collectFormAncestorErrors( xml ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'collectSubmitButtonErrors', () => {
		it( 'returns no errors when e-form has exactly one submit button', () => {
			const xml = parseXml( `
				<e-form>
					<e-form-input />
					<e-form-submit-button />
				</e-form>
			` );
			expect( collectSubmitButtonErrors( xml ) ).toHaveLength( 0 );
		} );

		it( 'returns no errors when submit button is nested inside a container within e-form', () => {
			const xml = parseXml( `
				<e-form>
					<e-flexbox>
						<e-form-submit-button />
					</e-flexbox>
				</e-form>
			` );
			expect( collectSubmitButtonErrors( xml ) ).toHaveLength( 0 );
		} );

		it( 'returns an error when e-form has no submit button', () => {
			const xml = parseXml( `
				<e-form>
					<e-form-input />
				</e-form>
			` );
			const errors = collectSubmitButtonErrors( xml );
			expect( errors ).toHaveLength( 1 );
			expect( errors[ 0 ] ).toContain( 'e-form-submit-button' );
		} );

		it( 'returns an error when e-form has more than one submit button', () => {
			const xml = parseXml( `
				<e-form>
					<e-form-submit-button />
					<e-form-submit-button />
				</e-form>
			` );
			const errors = collectSubmitButtonErrors( xml );
			expect( errors ).toHaveLength( 1 );
			expect( errors[ 0 ] ).toContain( '2' );
		} );

		it( 'returns one error per e-form that is missing a submit button', () => {
			const xml = parseXml( `
				<e-form>
					<e-form-input />
				</e-form>
				<e-form>
					<e-form-input />
				</e-form>
			` );
			expect( collectSubmitButtonErrors( xml ) ).toHaveLength( 2 );
		} );

		it( 'returns no errors when there are no e-form elements', () => {
			const xml = parseXml( `
				<e-flexbox>
					<e-heading />
				</e-flexbox>
			` );
			expect( collectSubmitButtonErrors( xml ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'collectEmptyMessageErrors', () => {
		it( 'returns no errors when success message has children', () => {
			const xml = parseXml( `
				<e-form>
					<e-form-success-message>
						<e-atomic-paragraph />
					</e-form-success-message>
				</e-form>
			` );
			expect( collectEmptyMessageErrors( xml ) ).toHaveLength( 0 );
		} );

		it( 'returns no errors when error message has children', () => {
			const xml = parseXml( `
				<e-form>
					<e-form-error-message>
						<e-atomic-paragraph />
					</e-form-error-message>
				</e-form>
			` );
			expect( collectEmptyMessageErrors( xml ) ).toHaveLength( 0 );
		} );

		it( 'returns an error when success message is empty', () => {
			const xml = parseXml( `
				<e-form>
					<e-form-success-message />
				</e-form>
			` );
			const errors = collectEmptyMessageErrors( xml );
			expect( errors ).toHaveLength( 1 );
			expect( errors[ 0 ] ).toContain( 'e-form-success-message' );
		} );

		it( 'returns an error when error message is empty', () => {
			const xml = parseXml( `
				<e-form>
					<e-form-error-message />
				</e-form>
			` );
			const errors = collectEmptyMessageErrors( xml );
			expect( errors ).toHaveLength( 1 );
			expect( errors[ 0 ] ).toContain( 'e-form-error-message' );
		} );

		it( 'returns two errors when both success and error messages are empty', () => {
			const xml = parseXml( `
				<e-form>
					<e-form-success-message />
					<e-form-error-message />
				</e-form>
			` );
			expect( collectEmptyMessageErrors( xml ) ).toHaveLength( 2 );
		} );

		it( 'returns no errors when there are no message elements', () => {
			const xml = parseXml( `
				<e-form>
					<e-form-input />
					<e-form-submit-button />
				</e-form>
			` );
			expect( collectEmptyMessageErrors( xml ) ).toHaveLength( 0 );
		} );

		it( 'returns no errors when message element is outside e-form but has children', () => {
			const xml = parseXml( `
				<e-flexbox>
					<e-form-success-message>
						<e-atomic-paragraph />
					</e-form-success-message>
				</e-flexbox>
			` );
			expect( collectEmptyMessageErrors( xml ) ).toHaveLength( 0 );
		} );
	} );
} );
