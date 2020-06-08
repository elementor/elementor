import ComponentBase from 'elementor-api/modules/component-base';

const TEST_OBJECT = {
	simpleKeyValue: 'value',
	complexObject: {
		anotherObject: {
			key: 'value',
		},
		simpleKeyValue: 'in complex object',
	},
};

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/core/data/cache.js', ( hooks ) => {
		hooks.beforeEach( () => {
			$e.data.cache.storage.clear();
		} );

		QUnit.test( 'getAsync(): simple ', async ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'receive-simple-component';
					}
				} ),
				randomValue = Math.random().toString(),
				requestData = {
					endpoint: $e.data.commandToEndpoint( component.getNamespace(), {} ),
					command: component.getNamespace(),
					component: component,
				};

			// Set cache test item.
			$e.data.cache.storage.setItem( component.getNamespace(), randomValue );

			const result = await $e.data.cache.getAsync( requestData );

			assert.equal( requestData.cache, 'hit' ); // added to requestData by receive.
			assert.equal( randomValue, result );
		} );

		QUnit.test( 'set(): value', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'load-value-component';
					}
				} ),
				randomValue = Math.random().toString(),
				requestData = {
					endpoint: $e.data.commandToEndpoint( component.getNamespace(), {} ),
					command: component.getNamespace(),
					component: component,
				};

			$e.data.cache.set( requestData, randomValue );

			assert.equal( randomValue, $e.data.cache.storage.getItem( component.getNamespace() ) );
		} );

		QUnit.test( 'set(): object', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'load-object-component';
					}
				} ),
				requestData = {
					endpoint: $e.data.commandToEndpoint( component.getNamespace(), {} ),
					command: component.getNamespace(),
					component: component,
				};

			$e.data.cache.set( requestData, TEST_OBJECT );

			assert.deepEqual( $e.data.cache.storage.getItem( component.getNamespace() ), TEST_OBJECT );
		} );

		QUnit.test( 'set(): deep', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'load-deep-component';
					}
				} ),
				requestData = {
					endpoint: $e.data.commandToEndpoint( component.getNamespace(), {} ),
					command: component.getNamespace(),
					component: component,
				};

			// Load TEST_OBJECT to cache 'load-deep-component = TEST_OBJECT'.
			$e.data.cache.set( requestData, TEST_OBJECT );

			assert.deepEqual( $e.data.cache.storage.getItem( component.getNamespace() ), TEST_OBJECT );

			// Modify `TEST_OBJECT.complexObject`.
			requestData.endpoint += '/complexObject';

			$e.data.cache.set( requestData, {
				newKey: 'newValue',
			} );

			// Modify `TEST_OBJECT.complexObject.anotherObject`.
			requestData.endpoint += '/anotherObject';

			$e.data.cache.set( requestData, {
				newKey: 'newValue',
			} );

			// Validate.
			assert.deepEqual( $e.data.cache.storage.getItem( component.getNamespace() ), {
				simpleKeyValue: 'value',
				complexObject: {
					anotherObject: {
						key: 'value',
						newKey: 'newValue',
					},
					simpleKeyValue: 'in complex object',
					newKey: 'newValue',
				},
			} );
		} );

		QUnit.test( 'get(): simple', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'get-simple-component';
					}
				} ),
				randomValue = Math.random().toString(),
				requestData = {
					endpoint: $e.data.commandToEndpoint( component.getNamespace(), {} ),
					command: component.getNamespace(),
					component: component,
				};

			$e.data.cache.set( requestData, randomValue );

			const result = $e.data.cache.get( requestData );

			assert.equal( result, randomValue );
		} );

		QUnit.test( 'get(): complex', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'get-complex-component';
					}
				} ),
				requestData = {
					endpoint: $e.data.commandToEndpoint( component.getNamespace(), {} ),
					command: component.getNamespace(),
					component: component,
				};

			$e.data.cache.set( requestData, TEST_OBJECT );

			requestData.endpoint = component.getNamespace() + '/simpleKeyValue';

			const simpleKeyValue = $e.data.cache.get( requestData );

			requestData.endpoint = component.getNamespace() + '/complexObject';

			const complexObject = $e.data.cache.get( requestData );

			requestData.endpoint = component.getNamespace() + '/complexObject/anotherObject';

			const complexObjectAnotherObject = $e.data.cache.get( requestData );

			requestData.endpoint = component.getNamespace() + '/complexObject/anotherObject/key';

			const complexObjectAnotherObjectKey = $e.data.cache.get( requestData );

			requestData.endpoint = component.getNamespace() + '/complexObject/simpleKeyValue';

			const complexObjectSimpleKeyValue = $e.data.cache.get( requestData );

			assert.equal( simpleKeyValue, TEST_OBJECT.simpleKeyValue );
			assert.deepEqual( complexObject, TEST_OBJECT.complexObject );
			assert.deepEqual( complexObjectAnotherObject, TEST_OBJECT.complexObject.anotherObject );
			assert.equal( complexObjectAnotherObjectKey, TEST_OBJECT.complexObject.anotherObject.key );
			assert.equal( complexObjectSimpleKeyValue, TEST_OBJECT.complexObject.simpleKeyValue );
		} );

		QUnit.test( 'update(): simple', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'update-simple-component';
					}
				} ),
				requestData = {
					endpoint: $e.data.commandToEndpoint( component.getNamespace(), {} ),
					command: component.getNamespace(),
					component: component,
					args: {},
				},
				randomValue = Math.random().toString();

			$e.data.cache.set( requestData, TEST_OBJECT );

			const newObject = elementor.helpers.cloneObject( TEST_OBJECT );

			newObject.complexObject.anotherObject.key = randomValue;
			newObject.complexObject.simpleKeyValue = randomValue;
			newObject.simpleKeyValue = randomValue;

			requestData.args.data = newObject;

			$e.data.cache.update( requestData );

			const result = $e.data.cache.get( requestData );

			assert.deepEqual( newObject, result );
		} );

		QUnit.test( 'update(): deep', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'update-deep-component';
					}
				} ),
				requestData = {
					endpoint: $e.data.commandToEndpoint( component.getNamespace(), {} ),
					command: component.getNamespace(),
					component: component,
					args: {},
				},
				randomValue = Math.random().toString();

			$e.data.cache.set( requestData, TEST_OBJECT );

			// Update object.simpleKeyValue.
			requestData.args.data = {
				simpleKeyValue: randomValue,
			};
			requestData.endpoint = component.getNamespace();
			$e.data.cache.update( requestData );

			// Update object.complexObject.simpleKeyValue
			requestData.args.data = {
				simpleKeyValue: randomValue,
			};
			requestData.endpoint = component.getNamespace() + '/complexObject';
			$e.data.cache.update( requestData );

			// Update object.complexObject.anotherObject.key
			requestData.args.data = {
				key: randomValue,
			};
			requestData.endpoint = component.getNamespace() + '/complexObject/anotherObject';
			$e.data.cache.update( requestData );

			requestData.endpoint = component.getNamespace();

			const newObject = elementor.helpers.cloneObject( TEST_OBJECT );

			newObject.complexObject.anotherObject.key = randomValue;
			newObject.complexObject.simpleKeyValue = randomValue;
			newObject.simpleKeyValue = randomValue;

			const result = $e.data.cache.get( requestData );

			assert.deepEqual( result, newObject );
		} );

		QUnit.test( 'delete(): simple', ( assert ) => {
			const component = $e.components.register( new class TestComponent extends ComponentBase {
					getNamespace() {
						return 'delete-simple-component';
					}

					getData() {
						return {
							command: () => {},
						};
					}
				} ),
				command = component.getNamespace() + '/command',
				randomValue = Math.random().toString(),
				requestData = {
					endpoint: $e.data.commandToEndpoint( command, {} ),
					command: command,
					component: component,
				};

			$e.data.cache.set( requestData, {
				command: randomValue,
			} );

			$e.data.cache.delete( {
				component,
				command,
				endpoint: command,
			} );

			assert.equal( $e.data.cache.get( requestData ), null );
		} );
	} );
} );
