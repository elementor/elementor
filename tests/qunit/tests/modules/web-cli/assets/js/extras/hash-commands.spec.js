/* eslint-disable no-console */
import Component from './mock/component.spec';

QUnit.module( 'File: modules/web-cli/assets/js/extras/hash-commands.js', ( hooks ) => {
	let originalWarnFunction;

	hooks.before( () => {
		$e.components.register( new Component() );

		// Make sure the original warn function will not be triggered to avoid printing on the console.
		originalWarnFunction = console.warn;
		console.warn = () => {};
	} );

	hooks.after( () => {
		console.warn = originalWarnFunction;
	} );

	QUnit.test( 'get(): Ensure valid return format', ( assert ) => {
		// Act.
		const actual = $e.extras.hashCommands.get( '#whatever&e:run:test-command&e:route:test-route' );

		// Assert.
		assert.deepEqual( actual, [ {
			args: {},
			command: 'test-command',
			method: 'e:run',
		}, {
			args: {},
			command: 'test-route',
			method: 'e:route',
		} ] );
	} );

	QUnit.test( 'get(): Ensure valid return format - Command with args', ( assert ) => {
		// Act.
		const actual = $e.extras.hashCommands.get(
			'#e:run:test/command?{"number":1,"string":"test-string"}&e:run:test/command2&e:run:test/command3?{invalid-json}',
		);

		// Assert.
		assert.deepEqual( actual, [ {
			args: {
				number: 1,
				string: 'test-string',
			},
			command: 'test/command',
			method: 'e:run',
		}, {
			args: {},
			command: 'test/command2',
			method: 'e:run',
		}, {
			args: {},
			command: 'test/command3',
			method: 'e:run',
		} ] );
	} );

	QUnit.test( 'get(): Ensure valid return format - Only one hash command the start with (#)', ( assert ) => {
		// Act.
		const actual = $e.extras.hashCommands.get( '#e:run:my-component/command' );

		// Assert.
		assert.deepEqual( actual, [ {
			args: {},
			command: 'my-component/command',
			method: 'e:run',
		} ] );
	} );

	QUnit.test( 'run(): Ensure run performed', async ( assert ) => {
		// Arrange.
		const dispatcherOrig = $e.extras.hashCommands.dispatchersList[ 'e:run' ],
			dispatcherRunnerOrig = dispatcherOrig.runner;

		const ensureCallbackPerformed = [];

		dispatcherOrig.runner = () => ( command, args ) => {
			ensureCallbackPerformed.push( {
				command,
				args,
			} );
		};

		// Act.
		await $e.extras.hashCommands.run( [ {
			args: {},
			command: 'test-hash-commands/safe-command',
			method: 'e:run',
		}, {
			args: { number: 1, string: 'test-string' },
			command: 'test-hash-commands/safe-command',
			method: 'e:run',
		} ] );

		// Assert.
		assert.equal( ensureCallbackPerformed[ 0 ].command, 'test-hash-commands/safe-command' );
		assert.deepEqual( ensureCallbackPerformed[ 0 ].args, {} );
		assert.equal( ensureCallbackPerformed[ 1 ].command, 'test-hash-commands/safe-command' );
		assert.deepEqual( ensureCallbackPerformed[ 1 ].args, { number: 1, string: 'test-string' } );

		// Cleanup.
		dispatcherOrig.runner = dispatcherRunnerOrig;
	} );

	QUnit.test( 'run(): Ensure insecure command fails', ( assert ) => {
		assert.rejects(
			$e.extras.hashCommands.run( [ {
				args: {},
				command: 'test-hash-commands/insecure-command',
				method: 'e:run',
			} ] ),
			new Error( 'Attempting to run unsafe or non exist command: `test-hash-commands/insecure-command`.' ),
		);
	} );

	QUnit.test( 'run(): Ensure exception when no dispatcher found', ( assert ) => {
		assert.rejects(
			$e.extras.hashCommands.run( [ {
				args: {},
				command: 'test-hash-commands/insecure-command',
				method: 'e:non-exist-method',
			} ] ),
			new Error( 'No dispatcher found for the command: `test-hash-commands/insecure-command`.' ),
		);
	} );

	QUnit.test( 'run(): Ensure commands runs sequentially', async ( assert ) => {
		// Arrange.
		let sharedReference = 0;

		const callback = $e.commands.on( 'run', () => {
			sharedReference++;
		} );

		// Act.
		$e.extras.hashCommands.run( [ {
			args: {},
			command: 'test-hash-commands/safe-command',
			method: 'e:run',
		}, {
			args: {},
			command: 'test-hash-commands/async-command',
			method: 'e:run',
		}, {
			args: {},
			command: 'test-hash-commands/safe-command',
			method: 'e:run',
		} ] );

		// Ensure initial 'safe-command' run.
		assert.equal( sharedReference, 1 );

		// Give him tick to reach 2.
		// When a waiting for promise, it will release the event loop, to run other callbacks in the stack.
		await new Promise( ( h ) => setTimeout( h, 0 ) );

		// At this point its about to leave. it is still waits for 'async-command' finish it's timeout.
		// Assert. ( Without sequentially mechanism it would be 3. ).
		assert.equal( sharedReference, 2 );

		// Give him tick to reach 3.
		// After another tick in the event loop occurs, the async-command finally leave, and
		// safe-command which is last command, runs, that why sharedReference will become 3.
		await new Promise( ( h ) => setTimeout( h, 0 ) );

		assert.equal( sharedReference, 3 );

		// Cleanup.
		$e.commands.off( 'run:after', callback );
	} );
} );
