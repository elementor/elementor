import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { addDynamicTool } from '../tools/dynamic-tool';

type HandlerFunction = ( ...args: unknown[] ) => Promise<unknown>;

describe( 'Dynamic Tool', () => {
	let mockServer: { registerTool: jest.Mock };
	let toolHandler: HandlerFunction;

	let mockContainerWithoutDynamic: {
		settings: { controls: Record<string, unknown> };
		model: { attributes: { settings: Record<string, unknown> } };
	};

	beforeEach( () => {
		mockContainerWithoutDynamic = {
			settings: {
				controls: {
					text: {
						dynamic: {
							categories: [ 'text' ],
						},
					},
					nonDynamicControl: {},
				},
			},
			model: {
				attributes: {
					settings: {},
				},
			},
		};
	} );

	beforeEach( () => {
		mockServer = {
			registerTool: jest.fn( ( _name, _config, handler ) => {
				toolHandler = handler;
			} ),
		};

		Object.defineProperty( window, 'elementor', {
			value: {
				getContainer: jest.fn( () => mockContainerWithoutDynamic ),
				dynamicTags: {
					getConfig: jest.fn( () => ( {
						'post-title': { categories: [ 'text' ], name: 'Post Title' },
						'site-logo': { categories: [ 'image' ], name: 'Site Logo' },
					} ) ),
					tagDataToTagText: jest.fn( ( id, name ) => `__dynamic__${ id }__${ name }__` ),
				},
			},
			writable: true,
			configurable: true,
		} );

		Object.defineProperty( window, 'elementorCommon', {
			value: {
				helpers: {
					getUniqueId: jest.fn( () => 'test-id-123' ),
				},
			},
			writable: true,
			configurable: true,
		} );

		Object.defineProperty( window, '$e', {
			value: {
				run: jest.fn().mockImplementation( ( command, options ) => {
					if ( command === 'document/dynamic/enable' && options?.settings ) {
						const controlName = Object.keys( options.settings )[ 0 ];
						mockContainerWithoutDynamic.model.attributes.settings[ controlName ] = {
							__dynamic__: options.settings[ controlName ],
						};
					}
					return Promise.resolve( { success: true } );
				} ),
			},
			writable: true,
			configurable: true,
		} );

		addDynamicTool( mockServer as unknown as McpServer );
		jest.clearAllMocks();
	} );

	afterEach( () => {
		delete ( window as { elementor?: unknown } ).elementor;
		delete ( window as { elementorCommon?: unknown } ).elementorCommon;
		delete ( window as { $e?: unknown } ).$e;
	} );

	describe( 'successful operations', () => {
		it( 'should successfully get dynamic settings for control', async () => {
			const result = await toolHandler( {
				action: 'get-settings',
				elementId: 'element-123',
				controlName: 'text',
			} ) as { content: Array<{ text: string }> };

			expect( window.elementor.getContainer ).toHaveBeenCalledWith( 'element-123' );
			expect( result.content[ 0 ].text ).toContain( 'Post Title' );
			expect( result.content[ 0 ].text ).not.toContain( 'Site Logo' );
		} );

		it( 'should successfully enable dynamic tag', async () => {
			const result = await toolHandler( {
				action: 'enable',
				elementId: 'element-123',
				controlName: 'text',
				dynamicName: 'post-title',
				settings: { key: 'value' },
				hasRunGetDynamicSettings: true,
			} ) as { content: Array<{ text: string }> };

			expect( window.elementorCommon.helpers.getUniqueId ).toHaveBeenCalled();
			expect( window.$e.run ).toHaveBeenCalledWith( 'document/dynamic/enable', expect.any( Object ) );
			expect( result.content[ 0 ].text ).toContain( 'Dynamic content enabled' );
		} );
	} );

	describe( 'error handling', () => {
		it( 'should throw error when element not found', async () => {
			( window.elementor.getContainer as jest.Mock ).mockReturnValue( null );

			await expect( toolHandler( {
				action: 'get-settings',
				elementId: 'nonexistent',
				controlName: 'text',
			} ) ).rejects.toThrow( 'Element with ID nonexistent not found' );
		} );

		it( 'should throw error when control not found', async () => {
			await expect( toolHandler( {
				action: 'get-settings',
				elementId: 'element-123',
				controlName: 'nonexistent',
			} ) ).rejects.toThrow( 'Control "nonexistent" not found on element element-123' );
		} );

		it( 'should throw error when control does not support dynamic content', async () => {
			await expect( toolHandler( {
				action: 'get-settings',
				elementId: 'element-123',
				controlName: 'nonDynamicControl',
			} ) ).rejects.toThrow( 'Control "nonDynamicControl" does not support dynamic content' );
		} );

		it( 'should throw error when dynamic tags API not available', async () => {
			delete ( window.elementor as { dynamicTags?: unknown } ).dynamicTags;

			await expect( toolHandler( {
				action: 'get-settings',
				elementId: 'element-123',
				controlName: 'text',
			} ) ).rejects.toThrow( 'Dynamic tags API is not available' );
		} );

		it( 'should throw error when enabling without running get-settings first', async () => {
			await expect( toolHandler( {
				action: 'enable',
				elementId: 'element-123',
				controlName: 'text',
				dynamicName: 'post-title',
				settings: {},
			} ) ).rejects.toThrow( 'get-dynamic-settings action has not been run' );
		} );

		it( 'should throw error when enabling without required parameters', async () => {
			await expect( toolHandler( {
				action: 'enable',
				elementId: 'element-123',
				hasRunGetDynamicSettings: true,
			} ) ).rejects.toThrow( 'elementId, controlName, dynamicName, and settings are required' );
		} );

		it( 'should throw error when Elementor Common API not available', async () => {
			delete ( window as { elementorCommon?: unknown } ).elementorCommon;

			await expect( toolHandler( {
				action: 'enable',
				elementId: 'element-123',
				controlName: 'text',
				dynamicName: 'post-title',
				settings: {},
				hasRunGetDynamicSettings: true,
			} ) ).rejects.toThrow( 'Elementor Common API is not available' );
		} );

		it( 'should throw error when disabling without required parameters', async () => {
			await expect( toolHandler( {
				action: 'disable',
				elementId: 'element-123',
			} ) ).rejects.toThrow( 'elementId and controlName are required' );
		} );

		it( 'should throw error when disabling control without dynamic content enabled', async () => {
			await expect( toolHandler( {
				action: 'disable',
				elementId: 'element-123',
				controlName: 'text',
			} ) ).rejects.toThrow( 'does not have dynamic content enabled' );
		} );
	} );
} );
