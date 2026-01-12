import { createMockElementWithOverridable } from 'test-utils';
import { getContainer, updateElementSettings } from '@elementor/editor-elements';
import { __getStore as getStore } from '@elementor/store';

import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { SLICE_NAME } from '../../store/store';
import { initCleanOverridablesOnCopyDuplicate } from '../clean-overridables-on-copy-duplicate';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getStore: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
	updateElementSettings: jest.fn(),
} ) );

type MockHook = { getCommand: () => string; apply: ( args: unknown, result?: unknown ) => void };

function createHooksRegistry() {
	let hooks: MockHook[] = [];

	return {
		getAll: () => hooks,

		reset: () => {
			hooks = [];
		},

		createClass: () => {
			return class {
				register() {
					hooks.push( this as never );
				}
			};
		},
	};
}

type WindowWithHooks = Window & {
	$e: {
		modules: {
			hookData: {
				After: ReturnType< ReturnType< typeof createHooksRegistry >[ 'createClass' ] >;
				Dependency: ReturnType< ReturnType< typeof createHooksRegistry >[ 'createClass' ] >;
			};
		};
	};
};

const MOCK_COMPONENT_ID = 123;
const ELEMENT_ID = 'element-1';

describe( 'initCleanOverridablesOnCopyDuplicate', () => {
	const hooksRegistry = createHooksRegistry();
	const eWindow = window as unknown as WindowWithHooks;

	let mockState: { currentComponentId: number | null };
	let mockStorageGet: jest.Mock;
	let mockStorageSet: jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		hooksRegistry.reset();

		eWindow.$e = {
			modules: {
				hookData: {
					After: hooksRegistry.createClass(),
					Dependency: hooksRegistry.createClass(),
				},
			},
		};

		mockState = {
			currentComponentId: MOCK_COMPONENT_ID,
		};

		jest.mocked( getStore ).mockReturnValue( {
			getState: () => ( {
				[ SLICE_NAME ]: mockState,
			} ),
		} as never );

		mockStorageGet = jest.fn();
		mockStorageSet = jest.fn();

		( window as unknown as { elementorCommon: { storage: { get: jest.Mock; set: jest.Mock } } } ).elementorCommon = {
			storage: {
				get: mockStorageGet,
				set: mockStorageSet,
			},
		};
	} );

	afterEach( () => {
		delete ( window as unknown as { elementorCommon?: unknown } ).elementorCommon;
	} );

	it( 'should register hooks for duplicate and copy commands', () => {
		// Act
		initCleanOverridablesOnCopyDuplicate();

		// Assert
		const registeredHooks = hooksRegistry.getAll();
		const commands = registeredHooks.map( ( hook ) => hook.getCommand() );

		expect( registeredHooks.length ).toBe( 2 );
		expect( commands ).toContain( 'document/elements/duplicate' );
		expect( commands ).toContain( 'document/elements/copy' );
	} );

	describe( 'duplicate - when editing component', () => {
		it( 'should clean overridable props on duplicate', () => {
			// Arrange
			initCleanOverridablesOnCopyDuplicate();
			const duplicateHook = getHookByCommand( 'document/elements/duplicate' );

			const element = createMockElementWithOverridable( ELEMENT_ID, {
				title: componentOverridablePropTypeUtil.create( {
					override_key: 'prop-123',
					origin_value: { $$type: 'html', value: 'Hello' },
				} ),
			} );

			jest.mocked( getContainer ).mockReturnValue( element );

			// Act
			duplicateHook.apply( {}, element );

			// Assert
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: ELEMENT_ID,
				props: {
					title: { $$type: 'html', value: 'Hello' },
				},
				withHistory: false,
			} );
		} );
	} );

	describe( 'duplicate - when not editing component', () => {
		beforeEach( () => {
			mockState.currentComponentId = null;
		} );

		it( 'should not clean overridable props on duplicate', () => {
			// Arrange
			initCleanOverridablesOnCopyDuplicate();
			const duplicateHook = getHookByCommand( 'document/elements/duplicate' );

			const element = createMockElementWithOverridable( ELEMENT_ID, {
				title: componentOverridablePropTypeUtil.create( {
					override_key: 'prop-123',
					origin_value: { $$type: 'html', value: 'Hello' },
				} ),
			} );

			jest.mocked( getContainer ).mockReturnValue( element );

			// Act
			duplicateHook.apply( {}, element );

			// Assert
			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'copy - when editing component', () => {
		it( 'should clean overridable props from clipboard storage on copy', () => {
			// Arrange
			initCleanOverridablesOnCopyDuplicate();
			const copyHook = getHookByCommand( 'document/elements/copy' );

			const storageData = {
				type: 'elementor',
				siteurl: 'http://localhost',
				elements: [
					{
						id: ELEMENT_ID,
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
			copyHook.apply( {} );

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
			initCleanOverridablesOnCopyDuplicate();
			const copyHook = getHookByCommand( 'document/elements/copy' );

			const storageData = {
				type: 'elementor',
				siteurl: 'http://localhost',
				elements: [
					{
						id: ELEMENT_ID,
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
			copyHook.apply( { storageKey: 'custom-clipboard' } );

			// Assert
			expect( mockStorageGet ).toHaveBeenCalledWith( 'custom-clipboard' );
			expect( mockStorageSet ).toHaveBeenCalledWith( 'custom-clipboard', expect.any( Object ) );
		} );
	} );

	describe( 'copy - when not editing component', () => {
		beforeEach( () => {
			mockState.currentComponentId = null;
		} );

		it( 'should not clean storage when not in edit mode', () => {
			// Arrange
			initCleanOverridablesOnCopyDuplicate();
			const copyHook = getHookByCommand( 'document/elements/copy' );

			// Act
			copyHook.apply( {} );

			// Assert
			expect( mockStorageGet ).not.toHaveBeenCalled();
			expect( mockStorageSet ).not.toHaveBeenCalled();
		} );
	} );

	function getHookByCommand( command: string ): MockHook {
		const hooks = hooksRegistry.getAll();
		const hook = hooks.find( ( h ) => h.getCommand() === command );

		if ( ! hook ) {
			throw new Error( `Expected hook for command '${ command }' to be registered` );
		}

		return hook;
	}
} );
