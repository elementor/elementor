import { CREATABLE, DELETABLE, EDITABLE, READABLE } from 'elementor-api/core/data';
import ComponentBase from 'elementor-api/modules/component-base';
import CommandData from 'elementor-api/modules/command-data';

// Test cache module.
require( './data/cache.spec.js' );

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/core/data.js', ( hooks ) => {
		hooks.before( () => {
			// wpApiSettings is required by $e.data.
			if ( ! window.wpApiSettings ) {
				window.wpApiSettings = {};
			}

			wpApiSettings.nonce = 'test';
		} );

		hooks.beforeEach( () => {
			$e.data.cache.storage.clear();
		} );

		QUnit.test( 'getHTTPMethod(): validate all options', ( assert ) => {
			assert.equal( $e.data.getHTTPMethod( 'create' ), 'POST' );
			assert.equal( $e.data.getHTTPMethod( 'delete' ), 'DELETE' );
			assert.equal( $e.data.getHTTPMethod( 'get' ), 'GET' );
			assert.equal( $e.data.getHTTPMethod( 'update' ), 'PUT' );
		} );

		QUnit.test( 'getAllowedMethods(): validate all options', ( assert ) => {
			assert.deepEqual( $e.data.getAllowedMethods( 'create' ), CREATABLE );
			assert.deepEqual( $e.data.getAllowedMethods( 'delete' ), DELETABLE );
			assert.deepEqual( $e.data.getAllowedMethods( 'get' ), READABLE );
			assert.deepEqual( $e.data.getAllowedMethods( 'update' ), EDITABLE );
		} );

		QUnit.test( 'commandToEndpoint(): command with format', ( assert ) => {
			const command = 'component/:paramA/command/:paramB',
				args = { query: {} };

			args.query.paramA = 'valueA';
			args.query.paramB = 'valueB';

			const endpoint = $e.data.commandToEndpoint( command, args );

			assert.equal( endpoint, 'component/valueA/command/valueB', 'Valid endpoint.' );
		} );

		QUnit.test( 'commandToEndpoint(): command with query', ( assert ) => {
			const command = 'component/command',
				args = { query: {} };

			args.query.paramA = 'valueA';
			args.query.paramB = 'valueB';

			const endpoint = $e.data.commandToEndpoint( command, args );

			assert.equal( endpoint, 'component/command?paramA=valueA&paramB=valueB', 'Valid endpoint.' );
		} );

		QUnit.test( 'commandToEndpoint(): command with query and index', ( assert ) => {
			const command = 'component/index',
				args = { query: {} };

			args.query.paramA = 'valueA';
			args.query.paramB = 'valueB';

			const endpoint = $e.data.commandToEndpoint( command, args );

			assert.equal( endpoint, 'component?paramA=valueA&paramB=valueB', 'Valid endpoint.' );
		} );

		QUnit.test( 'endpointToCommand(): endpoints with index and id', ( assert ) => {
			const Component = class extends ComponentBase {
					getNamespace() {
						return 'test-data-commands';
					}

					defaultData() {
						return {
							index: () => {},
							'test-id': () => {},
						};
					}
				},
				component = $e.components.register( new Component() );

			const endpointWithIndex = $e.data.endpointToCommand( 'test-data-commands', {} ),
				endpointWithId = $e.data.endpointToCommand( 'test-data-commands/test-id/some-id', {} );

			assert.equal( endpointWithIndex, component.getNamespace() + '/index' );
			assert.equal( endpointWithId, component.getNamespace() + '/test-id' );
		} );

		QUnit.test( 'prepareHeaders(): with GET', ( assert ) => {
			const requestData = { paramA: 'valueA' },
				params = $e.data.prepareHeaders( 'get', requestData );

			assert.equal( params.headers[ 'X-WP-Nonce' ], wpApiSettings.nonce );
		} );

		QUnit.test( 'prepareHeaders(): with POST', ( assert ) => {
			const requestData = { paramA: 'valueA' },
				params = $e.data.prepareHeaders( 'create', requestData );

			assert.equal( params.body, '{"paramA":"valueA"}' );
		} );

		QUnit.test( 'prepareHeaders(): with invalid type', ( assert ) => {
			const type = 'some-invalid-type';

			assert.throws( () => $e.data.prepareHeaders( type, {} ),
				new Error( `Invalid type: '${ type }'` )
			);
		} );

		/**
		 * FETCH, tests: is not mean to test if the *cache* mechanism is working correctly, but
		 * to test *fetch* with different approaches.
		 */
		QUnit.test( 'fetch(): simple', async ( assert ) => {
			$e.components.register( new class TestComponent extends ComponentBase {
				getNamespace() {
					return 'test-component-fetch-simple';
				}

				defaultData() {
					return this.importCommands( {
						TestCommand: class TestCommand extends CommandData {},
					} );
				}
			} );

			const fetchOrig = fetch,
				command = 'test-component-fetch-simple/test-command',
				response = {
					json: () => response,
					ok: true,
					data: {
						testParam: 'testValue',
					},
				},
				args = {
					options: {
						refresh: true,
					},
					query: {
						param1: 'valueA',
					},
				},
				endpoint = $e.data.commandToEndpoint( command, args );

			fetch = ( address, params ) => {
				fetch = fetchOrig;
				return new Promise( async ( resolve ) => {
					resolve( response );
				} );
			};

			const result = await $e.data.fetch( 'get', {
				endpoint,
				command,
				args,
			} );

			// Validate result.
			assert.deepEqual( response.data, result.data );

			// Validate item didn't get cached.
			assert.equal( $e.data.cache.storage.getItem( endpoint ), null );
		} );

		QUnit.test( 'fetch(): with cache', async ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
				getNamespace() {
					return 'test-component-with-cache';
				}

				defaultData() {
					return this.importCommands( {
						TestCommand: class TestCommand extends CommandData {},
					} );
				}
			} );

			const fetchOrig = fetch,
				command = 'test-component-with-cache/test-command',
				response = {
					json: () => response,
					ok: true,
					data: {
						testParam: 'testValue',
					},
				},
				args = {
					query: {
						param1: 'valueA',
					},
				},
				endpoint = $e.data.commandToEndpoint( command, args );

			fetch = ( address, params ) => {
				fetch = fetchOrig;
				return new Promise( async ( resolve ) => {
					resolve( response );
				} );
			};

			const requestData = {
				component,
				endpoint,
				command,
				args,
			};

			const result = await $e.data.fetch( 'get', requestData );

			// Validate result.
			assert.deepEqual( response.data, result.data );
			// Validate item get cached.
			assert.deepEqual( $e.data.cache.get( requestData ).data, response.data );
		} );

		QUnit.test( 'fetch(): with cache loaded manually', async ( assert ) => {
			// Register test data command.
			const component = $e.components.register( new class TestComponent extends ComponentBase {
				getNamespace() {
					return 'test-component-cache-manually';
				}

				defaultData() {
					return this.importCommands( {
						TestCommand: class TestCommand extends CommandData {},
					} );
				}
			} );

			const data = { someProp: 'someValue' },
				query = { paramA: 'valueB' };

			// This test case relies on cache.
			$e.data.loadCache( component, 'test-component-cache-manually/test-command', query, data );

			// Get cache.
			const result = await $e.data.get( 'test-component-cache-manually/test-command', query );

			// Validate if data is same as result.data.
			assert.deepEqual( data, result.data );
		} );

		QUnit.test( 'getCache(): simple', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'get-cache-simple-component';
					}
				} ),
				requestData = {
					endpoint: $e.data.commandToEndpoint( component.getNamespace(), {} ),
					command: component.getNamespace(),
					component: component,
				},
				someData = {
					someKey: 'someValue',
				};

			$e.data.cache.load( requestData, someData );

			const result = $e.data.getCache( component, component.getNamespace() );

			assert.deepEqual( result, someData );
		} );

		QUnit.test( 'getCache(): with query', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'get-cache-query-component';
					}
				} ),
				args = {
					query: {
						paramA: 'valueA',
					},
				},
				requestData = {
					endpoint: $e.data.commandToEndpoint( component.getNamespace(), args ),
					command: component.getNamespace(),
					component: component,
					args,
				},
				someData = {
					someKey: 'someValue',
				};

			$e.data.cache.load( requestData, someData );

			const result = $e.data.getCache( component, component.getNamespace(), args.query );

			assert.deepEqual( result, someData );
		} );

		QUnit.test( 'loadCache(): with simple data', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'load-cache-simple-component';
					}
				} ),
				someData = {
					someKey: 'someValue',
				};

			$e.data.loadCache( component, component.getNamespace(), {}, someData );

			const result = $e.data.getCache( component, component.getNamespace() );

			assert.deepEqual( result, someData );
		} );

		QUnit.test( 'loadCache(): with query', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'load-cache-query-component';
					}
				} ),
				query = {
					param: 'value',
				},
				someData = {
					someKey: 'someValue',
				};

			$e.data.loadCache( component, component.getNamespace(), query, someData );

			const result = $e.data.getCache( component, component.getNamespace(), query );

			assert.deepEqual( result, someData );
		} );

		QUnit.test( 'updateCache(): component', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'update-cache-component';
					}
				} ),
				olData = {
					param: 'oldValue',
				},
				newData = {
					param: 'new-value',
				};

			$e.data.loadCache( component, component.getNamespace(), {}, olData );

			let result = $e.data.getCache( component, component.getNamespace() );

			assert.deepEqual( result, olData );

			$e.data.updateCache( component, component.getNamespace(), {}, newData );

			result = $e.data.getCache( component, component.getNamespace() );

			assert.deepEqual( result, newData );
		} );

		QUnit.test( 'updateCache(): specific data, by endpoint', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'update-cache-specific-data-endpoint-component';
					}
				} ),
				olData = {
					objectA: {
						paramA: 'valueA',
					},
				},
				change = {
					paramA: 'new-value',
				},
				newData = {
					objectA: change,
				};

			$e.data.loadCache( component, component.getNamespace(), {}, olData );

			let result = $e.data.getCache( component, component.getNamespace() );

			assert.deepEqual( result, olData );

			$e.data.updateCache( component, component.getNamespace() + '/objectA', {}, change );

			result = $e.data.getCache( component, component.getNamespace() );

			assert.deepEqual( result, newData );
		} );

		QUnit.test( 'updateCache(): specific data, by data object', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'update-cache-specific-data-object-component';
					}
				} ),
				olData = {
					objectA: {
						paramA: 'valueA',
					},
				},
				change = {
					objectA: {
						paramA: 'new-value',
					},
				};

			$e.data.loadCache( component, component.getNamespace(), {}, olData );

			let result = $e.data.getCache( component, component.getNamespace() );

			assert.deepEqual( result, olData );

			$e.data.updateCache( component, component.getNamespace(), {}, change );

			result = $e.data.getCache( component, component.getNamespace() );

			assert.deepEqual( result, change );
		} );

		QUnit.test( 'deleteCache(): simple', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
				getNamespace() {
					return 'delete-cache-simple-component';
				}
			} );

			$e.data.loadCache( component, component.getNamespace(), {}, {} );

			$e.data.deleteCache( component.getNamespace() );

			assert.equal( $e.data.getCache( component, component.getNamespace() ), null );
		} );
	} );
} );
