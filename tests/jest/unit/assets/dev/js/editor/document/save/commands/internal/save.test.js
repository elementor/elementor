import { Save } from 'elementor-document/save/commands/internal/save.js';

describe( 'Save', () => {
	let save;

	beforeEach( () => {
		save = new Save();
	} );

	describe( 'checkIfValueWasWoocommerceSetting', () => {
		it( 'should return true when the first key of settings starts with "woocommerce"', () => {
			const settings = { woocommerce_key: 'value' };
			expect( save.checkIfValueWasWoocommerceSetting( settings ) ).toBe( true );
		} );

		it( 'should return false when the first key of settings does not start with "woocommerce"', () => {
			const settings = { other_key: 'value' };
			expect( save.checkIfValueWasWoocommerceSetting( settings ) ).toBe( false );
		} );

		it( 'should return false when settings is not an object', () => {
			const settings = 'not_an_object';
			expect( save.checkIfValueWasWoocommerceSetting( settings ) ).toBe( false );
		} );
	} );
} );
