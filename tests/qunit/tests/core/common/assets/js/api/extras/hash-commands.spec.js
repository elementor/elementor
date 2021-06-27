import Component from './mock/component.spec';

QUnit.module( 'File: core/common/assets/js/api/extras/hash-commands.js', ( hooks ) => {
	hooks.before( () => {
		$e.components.register( new Component() );
	} );

	QUnit.test( 'get(): Ensure valid return format', ( assert ) => {
		// Act.
		const actual = $e.extras.hashCommands.get( '#whatever&e:run:test-command&e:route:test-route' );

		// Assert.
		assert.deepEqual( actual, [ {
			command: 'test-command',
			method: 'e:run',
		}, {
			command: 'test-route',
			method: 'e:route',
		} ] );
	} );

	QUnit.test( 'get(): Ensure valid return format - Only one hash command the start with (#)', ( assert ) => {
		// Act.
		const actual = $e.extras.hashCommands.get( '#e:run:my-component/command' );

		// Assert.
		assert.deepEqual( actual, [ {
			command: 'my-component/command',
			method: 'e:run',
		} ] );
	} );

	QUnit.test( 'run(): Ensure run performed', async ( assert ) => {
		// Arrange.
		const dispatcherOrig = $e.extras.hashCommands.dispatchersList[ 'e:run' ],
			dispatcherRunnerOrig = dispatcherOrig.runner;

		let ensureCallbackPerformed = '';

		dispatcherOrig.runner = ( command ) => {
			ensureCallbackPerformed = command;
		};

		// Act.
		await $e.extras.hashCommands.run( [ {
			command: 'test-hash-commands/safe-command',
			method: 'e:run',
		} ] );

		// Assert.
		assert.equal( ensureCallbackPerformed, 'test-hash-commands/safe-command' );

		// Cleanup.
		dispatcherOrig.runner = dispatcherRunnerOrig;
	} );

	QUnit.test( 'run(): Ensure insecure command fails', ( assert ) => {
		assert.rejects(
			$e.extras.hashCommands.run( [ {
				command: 'test-hash-commands/insecure-command',
				method: 'e:run',
			} ] ),
			new Error( 'Attempting to run unsafe or non exist command: `test-hash-commands/insecure-command`.' )
		);
	} );

	QUnit.test( 'run(): Ensure exception when no dispatcher found', ( assert ) => {
		assert.rejects(
			$e.extras.hashCommands.run( [ {
				command: 'test-hash-commands/insecure-command',
				method: 'e:non-exist-method',
			} ] ),
			new Error( 'No dispatcher found for the command: `test-hash-commands/insecure-command`.' )
		);
	} );

	QUnit.test( 'run(): Ensure commands runs sequentially', async ( assert ) => {
		// Arrange.
		let sharedReference = 0;

		const callback = $e.commands.on( 'run:after', ( component, command ) => {
			sharedReference++;
		} );

		// Act.
		$e.extras.hashCommands.run( [ {
			command: 'test-hash-commands/safe-command',
			method: 'e:run',
		}, {
			command: 'test-hash-commands/async-command',
			method: 'e:run',
		}, {
			command: 'test-hash-commands/safe-command',
			method: 'e:run',
		} ] );

		// Give him tick to reach 2.
		await new Promise( ( h ) => setTimeout( h, 0 ) );

		// Assert. ( Without sequentially mechanism it would be 3. ).
		assert.equal( sharedReference, 2 );

		// Give him tick to reach 3.
		await new Promise( ( h ) => setTimeout( h, 0 ) );

		assert.equal( sharedReference, 3 );

		// Cleanup.
		$e.commands.off( 'run:after', callback );
	} );
} );
