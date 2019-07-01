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

		assert.equal( elementorCommon.components.get( 'test' ), instance );
	} );

	QUnit.test( 'Register routes', ( assert ) => {
		const namespace = 'register-routes';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getRoutes() {
				return {
					routeA: () => {},
					routeB: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		const routes = elementorCommon.route.getAll();

		assert.notEqual( routes.indexOf( namespace + '/routeA' ), -1 );
		assert.notEqual( routes.indexOf( namespace + '/routeB' ), -1 );
	} );

	QUnit.test( 'Register routes via tabs', ( assert ) => {
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

	QUnit.test( 'Register without context', ( assert ) => {
		const Component = class extends elementorModules.Component {
			getNamespace() {
				return 'test';
			}
		};

		assert.throws(
			() => {
				new Component();
			},
			new Error( 'context is required' )
		);
	} );

	QUnit.test( 'Register without namespace', ( assert ) => {
		const Component = class extends elementorModules.Component {};

		assert.throws(
			() => {
				const instance = new Component( { context: self } );
				instance.getNamespace();
			},
			new Error( 'getNamespace must be override.' )
		);
	} );

	QUnit.test( 'Register commands', ( assert ) => {
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

	QUnit.test( 'Register shortcuts', ( assert ) => {
		const namespace = 'register-shortcuts';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getCommands() {
				return {
					commandA: () => {},
				};
			}

			getShortcuts() {
				return {
					commandA: {
						keys: 'ctrl+a',
					},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		const handlers = elementorCommon.shortcuts.handlers[ 'ctrl+a' ],
			keys = Object.keys( handlers );

		assert.equal( handlers[ keys[ 0 ] ].command, namespace + '/commandA' );
	} );

	QUnit.test( 'Register shortcuts missing command', ( assert ) => {
		const Component = class extends elementorModules.Component {
			getNamespace() {
				return 'test-shortcuts-no-command';
			}

			getShortcuts() {
				return {
					notExistCommand: {
						keys: 'ctrl+a',
					},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		const component = elementorCommon.components.get( 'test-shortcuts-no-command' ),
			handlers = elementorCommon.shortcuts.getAll();

		assert.equal( typeof handlers[ component.getNamespace() + '/notExistCommand' ], 'undefined' );
	} );

	QUnit.module( 'Commands' );

	QUnit.test( 'Error on register command without component', ( assert ) => {
		assert.throws(
			() => {
				elementorCommon.commands.register( '', 'save', () => {} );
			},
			new Error( "Commands: '' component is not exist." )
		);
	} );

	QUnit.test( 'Error on re-register command', ( assert ) => {
		const namespace = 're-register-command';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getCommands() {
				return {
					commandA: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		assert.throws(
			() => {
				elementorCommon.commands.register( namespace, 'commandA', () => {} );
			},
			new Error( `Commands: \`${ namespace + '/commandA' }\` is already registered.` )
		);
	} );

	QUnit.test( 'Error on run non exited command', ( assert ) => {
		assert.throws(
			() => {
				elementorCommon.commands.run( 'not-existing-command' );
			},
			new Error( 'Commands: `not-existing-command` not found.' )
		);
	} );

	QUnit.test( 'Run command', ( assert ) => {
		assert.expect( 3 );

		const namespace = 'run-command',
			command = namespace + '/commandA';
		let commandStatus = 'beforeRun';
		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getCommands() {
				return {
					commandA: () => {
						assert.equal( elementorCommon.commands.is( command ), true );
						commandStatus = 'afterRun';
					},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.commands.run( command );

		assert.equal( commandStatus, 'afterRun' );

		assert.equal( elementorCommon.commands.is( command ), false );
	} );

	QUnit.test( 'Run command with args', ( assert ) => {
		assert.expect( 3 );

		const namespace = 'run-command-with-args';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getCommands() {
				return {
					commandA: ( args ) => {
						assert.equal( args.argA, 1 );
						assert.equal( elementorCommon.commands.getCurrentArgs( namespace ), args );
					},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.commands.run( namespace + '/commandA', {
			argA: 1,
		} );

		assert.equal( elementorCommon.commands.getCurrentArgs( namespace ), false );
	} );

	QUnit.test( 'Run command with events args', ( assert ) => {
		const namespace = 'run-command-with-events-args';
		let onBeforeStatus = 'beforeRun',
			onAfterStatus = 'beforeRun';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getCommands() {
				return {
					commandA: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.commands.run( namespace + '/commandA', {
			onBefore: () => {
				onBeforeStatus = 'afterRun';
			},
			onAfter: () => {
				onAfterStatus = 'afterRun';
			},
		} );

		assert.equal( onBeforeStatus, 'afterRun' );
		assert.equal( onAfterStatus, 'afterRun' );
	} );

	QUnit.test( 'Check if run command is activate the component', ( assert ) => {
		const namespace = 'run-command-activate-component';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getCommands() {
				return {
					commandA: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.commands.run( namespace + '/commandA' );

		const activeComponent = Object.keys( elementorCommon.components.activeComponents ).pop();

		assert.equal( activeComponent, namespace );
	} );

	QUnit.test( 'Run command with dependency', ( assert ) => {
		let commandStatus = 'beforeRun';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return 'run-command-with-dependency';
			}

			dependency() {
				return false;
			}

			getCommands() {
				return {
					commandA: () => commandStatus = 'afterRun',
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		const component = elementorCommon.components.get( 'run-command-with-dependency' );

		elementorCommon.commands.run( component.getNamespace() + '/commandA' );

		assert.equal( commandStatus, 'beforeRun' );
	} );

	QUnit.module( 'Routes' );

	QUnit.test( 'Error on register route without component', ( assert ) => {
		assert.throws(
			() => {
				elementorCommon.route.register( '', 'panel', () => {} );
			},
			new Error( "Route: '' component is not exist." )
		);
	} );

	QUnit.test( 'Error on run non exited command', ( assert ) => {
		assert.throws(
			() => {
				elementorCommon.route.to( 'not-existing-route' );
			},
			new Error( 'Route: `not-existing-route` not found.' )
		);
	} );

	QUnit.test( 'Route to, is, isPartOf', ( assert ) => {
		const namespace = 'route-to',
			routeA = namespace + '/routeA',
			routeB = namespace + '/routeB';

		let routeAStatus = 'beforeRouteA',
			routeBStatus = 'beforeRouteA';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getRoutes() {
				return {
					routeA: () => {
						routeAStatus = 'afterRoute';
					},
					routeB: () => {
						routeBStatus = 'afterRoute';
					},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.route.to( routeA );

		assert.equal( elementorCommon.route.is( routeA ), true );
		assert.equal( elementorCommon.route.is( routeB ), false );
		assert.equal( routeAStatus, 'afterRoute' );

		elementorCommon.route.to( routeB );

		assert.equal( elementorCommon.route.is( routeB ), true );
		assert.equal( elementorCommon.route.is( routeA ), false );
		assert.equal( routeBStatus, 'afterRoute' );

		assert.equal( elementorCommon.route.isPartOf( namespace ), true );
		assert.equal( elementorCommon.route.isPartOf( 'notPartOf' ), false );
	} );

	QUnit.test( 'Route with args', ( assert ) => {
		assert.expect( 4 );

		const namespace = 'route-with-args',
			routeA = namespace + '/routeA';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getRoutes() {
				return {
					routeA: ( args ) => {
						assert.equal( args.argA, 1 );
					},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		const args = {
			argA: 1,
		};

		elementorCommon.route.to( namespace + '/routeA', args );

		assert.equal( elementorCommon.route.is( namespace + '/routeA', args ), true );
		assert.equal( elementorCommon.route.is( routeA ), false );

		assert.equal( elementorCommon.route.getCurrentArgs( namespace ), args );
	} );

	QUnit.test( 'Route with events args', ( assert ) => {
		const namespace = 'route-with-events-args';
		let onBeforeStatus = 'beforeRoute',
			onAfterStatus = 'beforeRoute';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getRoutes() {
				return {
					routeA: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.route.to( namespace + '/routeA', {
			onBefore: () => {
				onBeforeStatus = 'afterRoute';
			},
			onAfter: () => {
				onAfterStatus = 'afterRoute';
			},
		} );

		assert.equal( onBeforeStatus, 'afterRoute' );
		assert.equal( onAfterStatus, 'afterRoute' );
	} );

	QUnit.test( 'Route to tab & activate tab', ( assert ) => {
		const namespace = 'route-to-tab';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getTabs() {
				return {
					tabA: { title: 'tabA' },
					tabB: { title: 'tabB' },
				};
			}

			getTabsWrapperSelector() {
				return '#' + namespace;
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		const $fixture = jQuery(
			'<div id="' + namespace + '">' +
			'<div class="elementor-component-tab" data-tab="tabA"></div>' +
			'<div class="elementor-component-tab" data-tab="tabB"></div>' +
			'</div>'
		);

		jQuery( 'body' ).append( $fixture );

		elementorCommon.route.to( namespace + '/tabA' );

		assert.equal( $fixture.find( '.elementor-active' ).data( 'tab' ), 'tabA' );

		elementorCommon.route.to( namespace + '/tabB' );

		assert.equal( $fixture.find( '.elementor-active' ).data( 'tab' ), 'tabB' );

		$fixture.remove();
	} );

	QUnit.test( 'Add tab', ( assert ) => {
		const namespace = 'add-tab';

		const Component = class extends elementorModules.Component {
			__construct( args ) {
				super.__construct( args );

				this.tabs = {
					tabA: { title: 'tabA' },
					tabC: { title: 'tabC' },
				};
			}

			getNamespace() {
				return namespace;
			}

			getTabsWrapperSelector() {
				return '#' + namespace;
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		const component = elementorCommon.components.get( namespace ),
			newTabIndex = 1;

		component.addTab( 'tabB', {}, newTabIndex );

		const $fixture = jQuery(
			'<div id="' + namespace + '"></div>'
		);

		jQuery.each( component.getTabs(), ( tab ) => {
			$fixture.append( '<div class="elementor-component-tab" data-tab="' + tab + '"></div>' );
		} );

		jQuery( 'body' ).append( $fixture );

		elementorCommon.route.to( namespace + '/tabB' );

		assert.equal( $fixture.find( '.elementor-active' ).data( 'tab' ), 'tabB' );

		assert.equal( $fixture.find( '[data-tab=tabB]' ).index(), newTabIndex );

		$fixture.remove();
	} );

	QUnit.test( 'Check if route.to is activate the component', ( assert ) => {
		const namespace = 'route-activate-component';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getRoutes() {
				return {
					routeA: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.route.to( namespace + '/routeA' );

		const activeComponent = Object.keys( elementorCommon.components.activeComponents ).pop();

		assert.equal( activeComponent, namespace );
	} );

	QUnit.test( 'Route with dependency', ( assert ) => {
		const namespace = 'route-with-dependency';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			dependency() {
				return false;
			}

			getRoutes() {
				return {
					routeA: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.route.to( namespace + '/routeA' );

		assert.equal( elementorCommon.route.is( namespace + '/routeA' ), false );
	} );

	QUnit.test( 'Re-route is avoided', ( assert ) => {
		const namespace = 're-route-is-avoided';

		let routeCount = 0;

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getRoutes() {
				return {
					routeA: () => {
						routeCount++;
					},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.route.to( namespace + '/routeA' );
		assert.equal( routeCount, 1 );
		elementorCommon.route.to( namespace + '/routeA' );
		assert.equal( routeCount, 1 );
	} );

	QUnit.test( 'Open component dependency', ( assert ) => {
		const namespace = 'open-component-dependency';

		let openCount = 0;

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			open() {
				openCount++;
				return false;
			}

			getRoutes() {
				return {
					routeA: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.route.to( namespace + '/routeA' );

		assert.equal( openCount, 1 );

		assert.equal( elementorCommon.route.is( namespace + '/routeA' ), false );
	} );

	QUnit.test( 'Re-open component is avoided', ( assert ) => {
		const namespace = 're-open-is-avoided';

		let openCount = 0;

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			open() {
				openCount++;
				return true;
			}

			getRoutes() {
				return {
					routeA: () => {},
					routeB: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.route.to( namespace + '/routeA' );
		assert.equal( openCount, 1 );
		elementorCommon.route.to( namespace + '/routeB' );
		assert.equal( openCount, 1 );

		elementorCommon.components.get( namespace ).close();

		elementorCommon.route.to( namespace + '/routeA' );
		assert.equal( openCount, 2 );
	} );

	QUnit.test( 'On close route', ( assert ) => {
		const namespace = 'on-close-route';

		let routeStatus = 'notChanged';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			onCloseRoute() {
				routeStatus = 'closed';
			}

			getRoutes() {
				return {
					routeA: () => {},
					routeB: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.route.to( namespace + '/routeA' );
		assert.equal( routeStatus, 'notChanged' );

		elementorCommon.route.to( namespace + '/routeB' );
		assert.equal( routeStatus, 'closed' );
	} );

	QUnit.test( 'On route', ( assert ) => {
		const namespace = 'on-route';

		let routeStatus = 'beforeRoute';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			onRoute() {
				routeStatus = 'afterRoute';
			}

			getRoutes() {
				return {
					routeA: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.route.to( namespace + '/routeA' );
		assert.equal( routeStatus, 'afterRoute' );
	} );

	QUnit.test( 'State: save & restore', ( assert ) => {
		assert.expect( 6 ); // `restoreState` is expected to run `routeA` again.

		const namespace = 'state-save-restore';

		const routeArgs = {
			argsA: 1,
		};

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getRoutes() {
				return {
					routeA: ( args ) => {
						assert.equal( args, routeArgs );
					},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.route.to( namespace + '/routeA', routeArgs );
		elementorCommon.route.saveState( namespace );
		elementorCommon.components.get( namespace ).close();

		assert.equal( elementorCommon.route.getCurrent( namespace ), false );
		assert.equal( elementorCommon.route.getCurrentArgs( namespace ), false );

		elementorCommon.route.restoreState( namespace );

		assert.equal( elementorCommon.route.getCurrent( namespace ), namespace + '/routeA' );
		assert.equal( elementorCommon.route.getCurrentArgs( namespace ), routeArgs );
	} );

	QUnit.test( 'Refresh container', ( assert ) => {
		assert.expect( 2 ); // `refreshContainer` is expected to run `routeA` again.

		const namespace = 'refresh-container';

		const routeArgs = {
			argsA: 1,
		};

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getRoutes() {
				return {
					routeA: ( args ) => {
						assert.equal( args, routeArgs );
					},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.route.to( namespace + '/routeA', routeArgs );

		elementorCommon.route.refreshContainer( namespace );
	} );

	QUnit.module( 'Shortcuts' );

	const runShortcut = ( args ) => {
		jQuery( document ).trigger( jQuery.Event( 'keydown', args ) );
	};

	QUnit.test( 'Run shortcut', ( assert ) => {
		const namespace = 'run-shortcut';

		let commandStatus = 'beforeRun';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getCommands() {
				return {
					commandA: () => {
						commandStatus = 'afterRun';
					},
				};
			}

			getShortcuts() {
				return {
					commandA: {
						keys: 'ctrl+z',
					},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		runShortcut( { which: 90 /* z */, ctrlKey: true, metaKey: true } );

		assert.equal( commandStatus, 'afterRun' );
	} );

	QUnit.test( 'Run shortcut with scope', ( assert ) => {
		const namespace = 'run-shortcut-with-scope';

		let commandStatus = 'beforeRunInScope';

		const Component = class extends elementorModules.Component {
			getNamespace() {
				return namespace;
			}

			getCommands() {
				return {
					commandA: () => {
						commandStatus = 'afterRunInScope';
					},
				};
			}

			getRoutes() {
				return {
					routeA: () => {},
				};
			}

			getShortcuts() {
				return {
					commandA: {
						keys: 'ctrl+z',
						scopes: [ namespace ],
					},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		// Outside scope.
		runShortcut( { which: 90 /* z */, ctrlKey: true, metaKey: true } );

		assert.equal( commandStatus, 'beforeRunInScope', 'Shortcut not ran outside scope' );

		// Inside scope.
		elementorCommon.route.to( namespace + '/routeA' );

		runShortcut( { which: 90 /* z */, ctrlKey: true, metaKey: true } );

		assert.equal( commandStatus, 'afterRunInScope', 'Shortcut ran inside scope' );

		// Closed scope.
		elementorCommon.components.get( namespace ).close();

		commandStatus = 'beforeRunInScope';

		runShortcut( { which: 90 /* z */, ctrlKey: true, metaKey: true } );

		assert.equal( commandStatus, 'beforeRunInScope', 'Shortcut not ran after close scope' );

		// Second component with same shortcut.
		let secondCommandStatus = 'beforeRun';

		const SecondComponent = class extends elementorModules.Component {
			getNamespace() {
				return 'second-' + namespace;
			}

			getCommands() {
				return {
					commandA: () => {
						secondCommandStatus = 'afterRun';
					},
				};
			}

			getShortcuts() {
				return {
					commandA: {
						keys: 'ctrl+z',
					},
				};
			}
		};

		elementorCommon.components.register( new SecondComponent( { context: self } ) );

		// Activate the first component.
		elementorCommon.route.to( namespace + '/routeA' );

		runShortcut( { which: 90 /* z */, ctrlKey: true, metaKey: true } );

		assert.equal( secondCommandStatus, 'beforeRun', 'Shortcut with global scope not ran because of low priority' );

		// Close the first component.
		elementorCommon.components.get( namespace ).close();

		runShortcut( { which: 90 /* z */, ctrlKey: true, metaKey: true } );

		assert.equal( secondCommandStatus, 'afterRun', 'Shortcut with global scope ran because the scoped shortcut is closed' );
	} );

	QUnit.test( 'Modal component with esc shortcut', ( assert ) => {
		const namespace = 'modal-component-with-esc-shortcut';

		const Component = class extends elementorModules.Component {
			__construct( args ) {
				super.__construct( args );

				this.isModal = true;
			}

			getNamespace() {
				return namespace;
			}

			getRoutes() {
				return {
					routeA: () => {},
				};
			}
		};

		elementorCommon.components.register( new Component( { context: self } ) );

		elementorCommon.route.to( namespace + '/routeA' );

		runShortcut( { which: 27 /* esc */ } );

		assert.equal( elementorCommon.route.is( namespace + '/routeA' ), false, 'Component is closed by `esc` key.' );

		// Second component.
		const secondNamespace = 'second-' + namespace;

		const SecondComponent = class extends elementorModules.Component {
			__construct( args ) {
				super.__construct( args );

				this.isModal = true;
			}

			getNamespace() {
				return secondNamespace;
			}

			getRoutes() {
				return {
					routeA: () => {},
				};
			}
		};

		elementorCommon.components.register( new SecondComponent( { context: self } ) );

		const component = elementorCommon.components.get( namespace ),
			secondComponent = elementorCommon.components.get( secondNamespace );

		// Activate the second component.
		elementorCommon.route.to( secondNamespace + '/routeA' );

		// Activate the first component.
		elementorCommon.route.to( namespace + '/routeA' );

		// Ensure tow components are open.
		assert.equal( component.isOpen, true );
		assert.equal( secondComponent.isOpen, true );

		runShortcut( { which: 27 /* esc */ } );

		// Modals should be closed in LIFO order.
		assert.equal( component.isOpen, false, 'First Component is closed first' );
		assert.equal( secondComponent.isOpen, true );

		runShortcut( { which: 27 /* esc */ } );

		assert.equal( secondComponent.isOpen, false, 'Second Component is closed too' );
	} );
} );
