jQuery( () => {
	QUnit.module( 'Components' );

	QUnit.test( 'Register Component', ( assert ) => {
		const Component = class extends elementorModules.Component {
				getNamespace() {
					return 'test';
				}
			},
			instance = new Component( { context: self } );

		elementorCommon.components.register( instance );

		assert.equal( instance, elementorCommon.components.get( 'test' ) );
	} );

	QUnit.test( 'Register Component routes', ( assert ) => {
		const Component = class extends elementorModules.Component {
			getNamespace() {
				return 'test';
			}

			getRoutes() {
				return {
					routeA: () => {},
					routeB: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		const component = elementorCommon.components.get( 'test' ),
			expectRoutes = {};
		expectRoutes[ component.getNamespace() + '/routeA' ] = () => {};
		expectRoutes[ component.getNamespace() + '/routeB' ] = () => {};

		assert.propEqual(
			expectRoutes,
			elementorCommon.route.commands
		);
	} );

	QUnit.test( 'Register Component routes via tabs', ( assert ) => {
		const Component = class extends elementorModules.Component {
			getNamespace() {
				return 'test';
			}

			getTabs() {
				return {
					tabA: { title: 'tabA' },
					tabB: { title: 'tabB' },
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		const component = elementorCommon.components.get( 'test' );

		assert.equal( typeof elementorCommon.route.commands[ component.getNamespace() + '/tabA' ], 'function' );
		assert.equal( typeof elementorCommon.route.commands[ component.getNamespace() + '/tabB' ], 'function' );
	} );

	QUnit.test( 'Register Component without context', ( assert ) => {
		const Component = class extends elementorModules.Component {
			getNamespace() {
				return 'test';
			}
		};

		assert.throws(
			() => {
				new Component();
			},
			'context is required'
		);
	} );

	QUnit.test( 'Register Component without namespace', ( assert ) => {
		const Component = class extends elementorModules.Component {};

		assert.throws(
			() => {
				const instance = new Component( { context: self } );
				instance.getNamespace();
			},
			'getNamespace must be override.'
		);
	} );

	QUnit.test( 'Register Component commands', ( assert ) => {
		const Component = class extends elementorModules.Component {
			getNamespace() {
				return 'test-commands';
			}

			getCommands() {
				return {
					commandA: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		const component = elementorCommon.components.get( 'test-commands' );

		assert.equal( typeof elementorCommon.commands.commands[ component.getNamespace() + '/commandA' ], 'function' );
	} );

	QUnit.module( 'Commands' );

	QUnit.test( 'Error on register command without component', ( assert ) => {
		assert.throws(
			() => {
				elementorCommon.commands.register( '', 'save', () => 'saved'.log( 'saved' ) );
			},
			"Commands: '' component is not exist" );
	} );
} );
