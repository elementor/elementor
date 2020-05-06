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

		QUnit.test( 'commandToEndpoint(): command with query', ( assert ) => {
			const command = 'component/command',
				args = { query: {} };

			args.query.paramA = 'valueA';
			args.query.paramB = 'valueB';

			const endpoint = $e.data.commandToEndpoint( command, args );

			assert.equal( endpoint, 'component/command?paramA=valueA&paramB=valueB&', 'Valid endpoint.' );
		} );

		QUnit.test( 'commandToEndpoint(): command with query and index', ( assert ) => {
			const command = 'component/index',
				args = { query: {} };

			args.query.paramA = 'valueA';
			args.query.paramB = 'valueB';

			const endpoint = $e.data.commandToEndpoint( command, args );

			assert.equal( endpoint, 'component?paramA=valueA&paramB=valueB&', 'Valid endpoint.' );
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
			const testComponent = $e.components.register( new class TestComponent extends ComponentBase {
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
			$e.components.register( new class TestComponent extends ComponentBase {
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

			const result = await $e.data.fetch( 'get', {
				endpoint,
				command,
				args,
			} );

			// Validate result.
			assert.deepEqual( response.data, result.data );

			// Validate item get cached.
			assert.equal( $e.data.cache.storage.getItem( endpoint ), JSON.stringify( response ) );
		} );

		QUnit.test( 'fetch(): with cache loaded manually', async ( assert ) => {
			// Register test data command.
			$e.components.register( new class TestComponent extends ComponentBase {
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
			$e.data.loadCache( 'test-component-cache-manually/test-command', query, data );

			// Get cache.
            const result = await $e.data.get( 'test-component-cache-manually/test-command', query );

            // Validate if data is same as result.data.
			assert.deepEqual( data, result.data );
		} );

		QUnit.test( 'getCache(): simple', ( assert ) => {
			const key = 'some-test-key',
				data = 'some-test-value';

			$e.data.cache.storage.setItem( key, JSON.stringify( data ) );

			const result = $e.data.getCache( key, {} );

			assert.equal( result, data );
		} );

		QUnit.test( 'getCache(): with query', ( assert ) => {
			const command = 'some-test-key',
				data = 'some-test-value',
				query = { param: 'value' },
				endpoint = $e.data.commandToEndpoint( command, { query } );

			$e.data.cache.storage.setItem( endpoint, JSON.stringify( data ) );

			const result = $e.data.getCache( command, query );

			assert.equal( result, data );
		} );

		QUnit.test( 'loadCache(): with simple data', ( assert ) => {
			const command = 'some-test-key',
				data = 'some-test-value';

			$e.data.loadCache( command, {}, data );

			const result = $e.data.getCache( command, {} );

			assert.equal( result, data );
		} );

		QUnit.test( 'loadCache(): with object data', ( assert ) => {
			const command = 'some-test-key',
				data = {
					extractedProp: 'some-value',
				};

			$e.data.loadCache( command, {}, data );

			const result = $e.data.getCache( `${ command }/extractedProp`, {} );

			assert.equal( result, data.extractedProp );
		} );

		QUnit.test( 'loadCache(): with query', ( assert ) => {
			const command = 'some-test-key',
				data = 'some-test-value',
				query = { param: 'value' };

			$e.data.loadCache( command, query, data );

			const result = $e.data.getCache( command, query );

			assert.equal( result, data );
		} );

		QUnit.test( 'updateCache(): with simple data', ( assert ) => {
			const command = 'some-test-key',
				query = { param: 'value' },
				data = 'old-value',
				newData = 'new-value';

			$e.data.loadCache( command, query, data );

			let result = $e.data.getCache( command, query );

			assert.equal( data, result );

			$e.data.updateCache( command, query, newData );

			result = $e.data.getCache( command, query );

			assert.equal( result, newData );
		} );

		QUnit.test( 'updateCache(): with object data', ( assert ) => {
			const command = 'some-test-key',
				query = { param: 'value' },
				data = { param: 'old-value' },
				newData = { param: 'new-value' };

			$e.data.loadCache( command, query, data );

			let result = $e.data.getCache( command, query );

			assert.deepEqual( data, result );

			$e.data.updateCache( command, query, newData );

			result = $e.data.getCache( command, query );

			assert.deepEqual( result, newData );
		} );

		QUnit.test( 'deleteCache(): simple', ( assert ) => {
			const command = 'some-test-key',
				data = 'value';

			$e.data.loadCache( command, {}, data );

			let result = $e.data.getCache( command, {} );

			assert.equal( data, result );

			$e.data.deleteCache( command );

			result = $e.data.getCache( command, {} );

			assert.notEqual( result, data );
		} );

		QUnit.test( 'deleteCache(): with query', ( assert ) => {
			const command = 'some-test-key',
				query = { param: 'value' },
				data = 'value';

			$e.data.loadCache( command, query, data );

			let result = $e.data.getCache( command, query );

			assert.equal( data, result );

			$e.data.deleteCache( command, query );

			result = $e.data.getCache( command, query );

			assert.notEqual( result, data );
		} );
	} );
} );
