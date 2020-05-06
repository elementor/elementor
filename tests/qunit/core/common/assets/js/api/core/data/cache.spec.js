import ComponentBase from 'elementor-api/modules/component-base';

const COMPLEX_OBJECT = {
	simpleKeyValue: 'value',
	complexObject: {
		anotherObject: {
			key: 'value',
		},
		simpleKeyValue: 'in complex object',
	},
};

// TODO: Rewrite / Refactor test(s).

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/core/data/cache.js', ( hooks ) => {
		hooks.beforeEach( () => {
			$e.data.cache.storage.clear();
		} );

		QUnit.test( 'extractData(): filter-object-component', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'test-extract-data-filter-object-component';
					}

					defaultData() {
						return {
							index: () => {},
						};
					}
				} ),
				command = component.getNamespace() + '/index',
				data = COMPLEX_OBJECT,
				requestData = {
					endpoint: '',
					command,
					component,
					args: {
						query: {},
					},
				},
				result = {};

			requestData.endpoint = $e.data.commandToEndpoint( requestData.command, requestData.args );

			$e.data.cache.extractData( data, requestData, ( key, value ) => {
				result[ key ] = value;
			}, 'filter-object-component' );

			assert.deepEqual( result, {
				'test-extract-data-filter-object-component/simpleKeyValue': 'value',
				'test-extract-data-filter-object-component/complexObject/anotherObject': {
					key: 'value',
				},
				'test-extract-data-filter-object-component/complexObject/simpleKeyValue': 'in complex object',
			} );
		} );

		QUnit.test( 'extractData(): filter-object', ( assert ) => {
			const command = 'test-extract-data-filter-object/test',
				data = COMPLEX_OBJECT,
				requestData = {
					endpoint: '',
					command,
					args: {
						query: {},
					},
				},
				result = {};

			requestData.endpoint = $e.data.commandToEndpoint( requestData.command, requestData.args );

			$e.data.cache.extractData( data, requestData, ( key, value ) => {
				result[ key ] = value;
			}, 'filter-object' );

			assert.deepEqual( result, {
				'test-extract-data-filter-object/test/simpleKeyValue': 'value',
				'test-extract-data-filter-object/test/complexObject': {
					anotherObject: { key: 'value' },
					simpleKeyValue: 'in complex object',
				},
			} );
		} );

		QUnit.test( 'extractData(): filter-key-value ', ( assert ) => {
			const command = 'filter-key-value/test',
				data = COMPLEX_OBJECT,
				requestData = {
					endpoint: '',
					command,
					args: {
						query: {},
					},
				},
				result = {};

			requestData.endpoint = $e.data.commandToEndpoint( requestData.command, requestData.args );

			$e.data.cache.extractData( data, requestData, ( key, value ) => {
				result[ key ] = value;
			}, 'filter-key-value' );

			assert.deepEqual( result[ requestData.endpoint ], data );
		} );

		QUnit.test( 'receive(): simple ', async ( assert ) => {
			const value = 'receive-value-' + Math.random().toString(),
				randomKey = Math.random().toString();

			$e.data.cache.storage.setItem( randomKey, JSON.stringify( value ) );

			const result = await $e.data.cache.receive( { endpoint: randomKey } );

			assert.equal( value, result );
		} );

		QUnit.test( 'load(): simple', ( assert ) => {
			const value = 'load-value-' + Math.random().toString(),
				randomKey = Math.random().toString();

			$e.data.cache.load( {
				endpoint: randomKey,
				args: {
					query: {},
					options: {
						filter: 'filter-key-value',
					},
				},
			}, value );

			assert.equal( value, JSON.parse( $e.data.cache.storage.getItem( randomKey ) ) );
		} );

		QUnit.test( 'get(): simple', ( assert ) => {
			const value = 'get-value-' + Math.random().toString(),
				randomKey = Math.random().toString();

			$e.data.cache.storage.setItem( randomKey, JSON.stringify( value ) );

			const result = $e.data.cache.get( { endpoint: randomKey } );

			assert.equal( value, result );
		} );

		QUnit.test( 'update(): key value', ( assert ) => {
			const randomKey = Math.random().toString(),
				requestData = {
					command: '',
					endpoint: randomKey,
					args: {
						query: {},
						options: {
							filter: 'filter-key-value',
						},
						data: COMPLEX_OBJECT,
					},
				};

			$e.data.cache.load( requestData, requestData.args.data );

			const newObject = elementor.helpers.cloneObject( COMPLEX_OBJECT );

			newObject.complexObject.anotherObject.key = randomKey;
			newObject.complexObject.simpleKeyValue = randomKey;
			newObject.simpleKeyValue = randomKey;

			requestData.args.data = newObject;

			$e.data.cache.update( requestData );

			const result = $e.data.cache.get( requestData );

			assert.deepEqual( newObject, result );
		} );

		QUnit.test( 'update(): key value, mismatch data', ( assert ) => {
			const randomKey = Math.random().toString(),
				requestData = {
					command: '',
					endpoint: randomKey,
					args: {
						query: {},
						options: {
							filter: 'filter-key-value',
						},
						data: COMPLEX_OBJECT,
					},
				};

			$e.data.cache.load( requestData, requestData.args.data );

			requestData.args.data = 'mismatch-data';

			assert.throws(
				() => {
					$e.data.cache.update( requestData );
				},
				new Error( 'Invalid data: type mismatch' ),
			);
		} );

		QUnit.test( 'update(): component', ( assert ) => {
			const randomValue = Math.random().toString(),
				component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'update-component';
					}

					defaultData() {
						return {
							index: () => {},
						};
					}
				} ),
				command = component.getNamespace() + '/index',
					requestData = {
						command,
						endpoint: '',
						args: {
							query: {},
							options: {
								filter: 'filter-object-component',
							},
							data: COMPLEX_OBJECT,
						},
						component,
					},
				result = {};

			requestData.endpoint = $e.data.commandToEndpoint( requestData.command, requestData.args );

			// Load
			$e.data.cache.load( requestData, requestData.args.data );

			requestData.args.data.complexObject.simpleKeyValue = randomValue;
			requestData.args.data.complexObject.anotherObject.key = randomValue;
			requestData.args.data.simpleKeyValue = randomValue;

			// Update
			$e.data.cache.update( requestData );

			// Get data.
			$e.data.cache.extractData( $e.data.cache.storage.debug(), requestData, ( key, value ) => {
				if ( key.includes( requestData.endpoint ) ) {
					result[ key ] = value;
				}
			}, 'filter-object-component' );

			// Validate
			assert.deepEqual( result, {
				'update-component/simpleKeyValue': randomValue,
				'update-component/complexObject/simpleKeyValue': randomValue,
				'update-component/complexObject/anotherObject': {
					key: randomValue,
				},
			} );
		} );

		QUnit.test( 'delete(): specific endpoint', ( assert ) => {
			const value = 'delete-endpoint-' + Math.random().toString(),
				randomKey = Math.random().toString(),
				requestData = {
					endpoint: randomKey,
					command: '',
					args: {
						query: {},
						options: {
							filter: 'filter-key-value',
						},
					},
				};

			$e.data.cache.load( requestData, value );

			$e.data.cache.delete( requestData.endpoint );

			assert.equal( $e.data.cache.get( requestData ), null );
		} );

		QUnit.test( 'delete(): component', ( assert ) => {
			const randomValue = Math.random().toString(),
				component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'delete-component';
					}

					defaultData() {
						return {
							index: () => {},
						};
					}
				} ),
				command = component.getNamespace() + '/index',
				requestData = {
					command,
					endpoint: '',
					args: {
						query: {},
						options: {
							filter: 'filter-object-component',
						},
						data: COMPLEX_OBJECT,
					},
					component,
				},
				result = {};

			requestData.endpoint = $e.data.commandToEndpoint( requestData.command, requestData.args );

			// Load
			$e.data.cache.load( requestData, requestData.args.data );

			// Delete
			$e.data.cache.delete( requestData.endpoint );

			$e.data.cache.extractData( $e.data.cache.storage.debug(), requestData, ( key, value ) => {
				if ( key.includes( requestData.endpoint ) ) {
					result[ key ] = value;
				}
			}, 'filter-object-component' );

			assert.equal( Object.values( result ).length, 0 );
		} );
	} );
} );
