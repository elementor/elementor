import { blockCommand } from '../block-command';
import { type DataHook, registerDataHook, type WindowWithDataHooks } from '../register-data-hook';

describe( 'Data Hooks', () => {
	const eWindow = window as unknown as WindowWithDataHooks;

	const hooksRegistry = createHooksRegistry();

	beforeEach( () => {
		hooksRegistry.reset();

		eWindow.$e = {
			modules: {
				hookData: {
					Dependency: hooksRegistry.createClass(),
					After: hooksRegistry.createClass(),
				},
			},
		};
	} );

	describe( 'registerDataHook', () => {
		it( 'should register data hook', () => {
			// Act.
			const mockFn = jest.fn();

			registerDataHook( 'after', 'test-command-1', mockFn );
			registerDataHook( 'after', 'test-command-2', mockFn );
			registerDataHook( 'after', 'test-command-3', mockFn );

			// Assert.
			const registeredHooks = hooksRegistry.getAll();

			expect( registeredHooks ).toHaveLength( 3 );

			const [ hook1, hook2, hook3 ] = registeredHooks;

			expect( hook1.getCommand() ).toEqual( 'test-command-1' );
			expect( hook2.getCommand() ).toEqual( 'test-command-2' );
			expect( hook3.getCommand() ).toEqual( 'test-command-3' );

			expect( hook1.getId() ).toMatch( /^test-command-1--data--\d+$/ );
			expect( hook2.getId() ).toMatch( /^test-command-2--data--\d+$/ );
			expect( hook3.getId() ).toMatch( /^test-command-3--data--\d+$/ );

			hook1.apply( { id: 1 } );
			hook2.apply( { id: 2 } );
			hook3.apply( { id: 3 } );

			expect( mockFn ).toHaveBeenCalledTimes( 3 );
			expect( mockFn ).toHaveBeenNthCalledWith( 1, { id: 1 } );
			expect( mockFn ).toHaveBeenNthCalledWith( 2, { id: 2 } );
			expect( mockFn ).toHaveBeenNthCalledWith( 3, { id: 3 } );

			expect( hook1.getId() ).not.toEqual( hook2.getId() );
		} );

		it( 'should throw when the hooks classes do not exist', () => {
			// Arrange.
			delete eWindow.$e.modules?.hookData;

			// Act & Assert.
			expect( () => registerDataHook( 'after', 'test-command', () => {} ) ).toThrow(
				`Data hook 'after' is not available`
			);

			expect( () => registerDataHook( 'dependency', 'test-command', () => true ) ).toThrow(
				`Data hook 'dependency' is not available`
			);
		} );
	} );

	describe( 'blockCommand', () => {
		it( 'should register a data hook the block a command', () => {
			// Act.
			const hook = blockCommand( {
				command: 'test-command',
				condition: ( args ) => 'key' in args,
			} );

			// Assert.
			expect( hook.apply( { key: 'value' } ) ).toBe( false );
			expect( hook.apply( { value: 'value' } ) ).toBe( true );
		} );
	} );
} );

function createHooksRegistry() {
	let hooks: DataHook[] = [];

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
			} as typeof DataHook;
		},
	};
}
