import { createMockElement } from 'test-utils';
import { getContainer, updateElementSettings, type V1Element } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __getStore as getStore } from '@elementor/store';

import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { initCleanOverridablesOnCopy } from '../clean-overridables-on-copy';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
	updateElementSettings: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	registerDataHook: jest.fn(),
} ) );

jest.mock( '@elementor/store', () => ( {
	__getStore: jest.fn(),
} ) );

const mockGetContainer = jest.mocked( getContainer );
const mockUpdateElementSettings = jest.mocked( updateElementSettings );
const mockRegisterDataHook = jest.mocked( registerDataHook );
const mockGetStore = jest.mocked( getStore );

describe( 'initCleanOverridablesOnCopy', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should register hooks for duplicate and copy commands', () => {
		// Act
		initCleanOverridablesOnCopy();

		// Assert
		expect( mockRegisterDataHook ).toHaveBeenCalledTimes( 2 );
		expect( mockRegisterDataHook ).toHaveBeenCalledWith(
			'after',
			'document/elements/duplicate',
			expect.any( Function )
		);
		expect( mockRegisterDataHook ).toHaveBeenCalledWith(
			'after',
			'document/elements/copy',
			expect.any( Function )
		);
	} );

	describe( 'duplicate - when editing component', () => {
		beforeEach( () => {
			mockGetStore.mockReturnValue( {
				getState: () => ( {
					components: {
						currentComponentId: 123,
					},
				} ),
			} as never );
		} );

		it( 'should clean overridable props on duplicate', () => {
			// Arrange
			initCleanOverridablesOnCopy();
			const duplicateCallback = getDuplicateCallback();

			const element = createMockElementWithOverridable( 'element-1', {
				title: componentOverridablePropTypeUtil.create( {
					override_key: 'prop-123',
					origin_value: { $$type: 'html', value: 'Hello' },
				} ),
			} );

			mockGetContainer.mockReturnValue( element );

			// Act
			duplicateCallback( {}, element );

			// Assert
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: 'element-1',
				props: {
					title: { $$type: 'html', value: 'Hello' },
				},
				withHistory: false,
			} );
		} );
	} );

	describe( 'duplicate - when not editing component', () => {
		beforeEach( () => {
			mockGetStore.mockReturnValue( {
				getState: () => ( {
					components: {
						currentComponentId: null,
					},
				} ),
			} as never );
		} );

		it( 'should not clean overridable props on duplicate', () => {
			// Arrange
			initCleanOverridablesOnCopy();
			const duplicateCallback = getDuplicateCallback();

			const element = createMockElementWithOverridable( 'element-1', {
				title: componentOverridablePropTypeUtil.create( {
					override_key: 'prop-123',
					origin_value: { $$type: 'html', value: 'Hello' },
				} ),
			} );

			mockGetContainer.mockReturnValue( element );

			// Act
			duplicateCallback( {}, element );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'copy - when editing component', () => {
		let mockStorageGet: jest.Mock;
		let mockStorageSet: jest.Mock;

		beforeEach( () => {
			mockGetStore.mockReturnValue( {
				getState: () => ( {
					components: {
						currentComponentId: 123,
					},
				} ),
			} as never );

			mockStorageGet = jest.fn();
			mockStorageSet = jest.fn();

			( window as never as { elementorCommon: { storage: { get: jest.Mock; set: jest.Mock } } } ).elementorCommon = {
				storage: {
					get: mockStorageGet,
					set: mockStorageSet,
				},
			};
		} );

		afterEach( () => {
			delete ( window as never as { elementorCommon?: unknown } ).elementorCommon;
		} );

		it( 'should clean overridable props from clipboard storage on copy', () => {
			// Arrange
			initCleanOverridablesOnCopy();
			const copyCallback = getCopyCallback();

			const storageData = {
				type: 'elementor',
				siteurl: 'http://localhost',
				elements: [
					{
						id: 'element-1',
						elType: 'widget',
						widgetType: 'e-heading',
						settings: {
							title: componentOverridablePropTypeUtil.create( {
								override_key: 'prop-123',
								origin_value: { $$type: 'html', value: 'Hello' },
							} ),
						},
					},
				],
			};

			mockStorageGet.mockReturnValue( storageData );

			// Act
			copyCallback( {} );

			// Assert
			expect( mockStorageSet ).toHaveBeenCalledWith( 'clipboard', {
				type: 'elementor',
				siteurl: 'http://localhost',
				elements: [
					expect.objectContaining( {
						settings: expect.objectContaining( {
							title: { $$type: 'html', value: 'Hello' },
						} ),
					} ),
				],
			} );
		} );

		it( 'should use custom storage key when provided', () => {
			// Arrange
			initCleanOverridablesOnCopy();
			const copyCallback = getCopyCallback();

			const storageData = {
				type: 'elementor',
				siteurl: 'http://localhost',
				elements: [
					{
						id: 'element-1',
						elType: 'widget',
						settings: {
							title: componentOverridablePropTypeUtil.create( {
								override_key: 'prop-123',
								origin_value: { $$type: 'html', value: 'Hello' },
							} ),
						},
					},
				],
			};

			mockStorageGet.mockReturnValue( storageData );

			// Act
			copyCallback( { storageKey: 'custom-clipboard' } );

			// Assert
			expect( mockStorageGet ).toHaveBeenCalledWith( 'custom-clipboard' );
			expect( mockStorageSet ).toHaveBeenCalledWith( 'custom-clipboard', expect.any( Object ) );
		} );
	} );

	describe( 'copy - when not editing component', () => {
		let mockStorageGet: jest.Mock;
		let mockStorageSet: jest.Mock;

		beforeEach( () => {
			mockGetStore.mockReturnValue( {
				getState: () => ( {
					components: {
						currentComponentId: null,
					},
				} ),
			} as never );

			mockStorageGet = jest.fn();
			mockStorageSet = jest.fn();

			( window as never as { elementorCommon: { storage: { get: jest.Mock; set: jest.Mock } } } ).elementorCommon = {
				storage: {
					get: mockStorageGet,
					set: mockStorageSet,
				},
			};
		} );

		afterEach( () => {
			delete ( window as never as { elementorCommon?: unknown } ).elementorCommon;
		} );

		it( 'should not clean storage when not in edit mode', () => {
			// Arrange
			initCleanOverridablesOnCopy();
			const copyCallback = getCopyCallback();

			// Act
			copyCallback( {} );

			// Assert
			expect( mockStorageGet ).not.toHaveBeenCalled();
			expect( mockStorageSet ).not.toHaveBeenCalled();
		} );
	} );
} );

function getDuplicateCallback() {
	const calls = mockRegisterDataHook.mock.calls;
	const duplicateCall = calls.find( ( call ) => call[ 1 ] === 'document/elements/duplicate' );
	return duplicateCall![ 2 ] as ( args: unknown, result: V1Element | V1Element[] ) => void;
}

function getCopyCallback() {
	const calls = mockRegisterDataHook.mock.calls;
	const copyCall = calls.find( ( call ) => call[ 1 ] === 'document/elements/copy' );
	return copyCall![ 2 ] as ( args: { storageKey?: string } ) => void;
}

function createMockElementWithOverridable(
	elementId: string,
	settings: Parameters< typeof createMockElement >[ 0 ][ 'settings' ]
): V1Element {
	return createMockElement( {
		model: {
			id: elementId,
			widgetType: 'e-heading',
			elType: 'widget',
		},
		settings,
	} );
}
