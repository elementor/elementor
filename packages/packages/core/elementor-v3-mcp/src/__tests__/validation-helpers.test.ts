import type { ElementorContainer } from '../types';
import {
	validateDocumentSettingsUpdated,
	validateDynamicTagDisabled,
	validateDynamicTagEnabled,
} from '../validation-helpers';

describe( 'Elementor Validation Helpers', () => {
	describe( 'validateDocumentSettingsUpdated', () => {
		it( 'should pass when settings are accessible', () => {
			const container = {
				settings: {
					attributes: { some: 'value' },
				},
			} as unknown as ElementorContainer;

			expect( () => validateDocumentSettingsUpdated( container ) ).not.toThrow();
		} );

		it( 'should throw when settings are not accessible', () => {
			const container = {
				settings: {},
			} as unknown as ElementorContainer;

			expect( () => validateDocumentSettingsUpdated( container ) ).toThrow( 'Document settings update failed' );
		} );
	} );

	describe( 'validateDynamicTagEnabled', () => {
		it( 'should pass when dynamic tag exists', () => {
			const container = {
				model: {
					attributes: {
						settings: {
							test_control: {
								__dynamic__: { enabled: true },
							},
						},
					},
				},
			} as unknown as ElementorContainer;

			expect( () => validateDynamicTagEnabled( container, 'test_control' ) ).not.toThrow();
		} );

		it( 'should throw when dynamic tag not found', () => {
			const container = {
				model: {
					attributes: {
						settings: {
							test_control: 'simple-value',
						},
					},
				},
			} as unknown as ElementorContainer;

			expect( () => validateDynamicTagEnabled( container, 'test_control' ) ).toThrow(
				'Dynamic tag enable failed'
			);
		} );
	} );

	describe( 'validateDynamicTagDisabled', () => {
		it( 'should pass when dynamic tag does not exist', () => {
			const container = {
				model: {
					attributes: {
						settings: {
							test_control: 'simple-value',
						},
					},
				},
			} as unknown as ElementorContainer;

			expect( () => validateDynamicTagDisabled( container, 'test_control' ) ).not.toThrow();
		} );

		it( 'should throw when dynamic tag still exists', () => {
			const container = {
				model: {
					attributes: {
						settings: {
							test_control: {
								__dynamic__: { enabled: true },
							},
						},
					},
				},
			} as unknown as ElementorContainer;

			expect( () => validateDynamicTagDisabled( container, 'test_control' ) ).toThrow(
				'Dynamic tag disable failed'
			);
		} );
	} );
} );
