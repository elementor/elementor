jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/index.js', ( hooks ) => {
		QUnit.test( 'getHashCommands(): Ensure valid return format', ( assert ) => {
			// Act.
			const actual = $e.getHashCommands( '#whatever&e:run:test-command&e:route:test-route' );

			// Assert.
			assert.deepEqual( actual, [ {
				callback: $e.run,
				command: 'test-command',
				method: 'e:run',
			}, {
				callback: $e.route,
				command: 'test-route',
				method: 'e:route',
			} ] );
		} );

		QUnit.test( 'getHashCommands(): Ensure valid return format - Only one hash command the start with (#)', ( assert ) => {
			// Act.
			const actual = $e.getHashCommands( '#e:run:my-component/command' );

			// Assert.
			assert.deepEqual( actual, [ {
				callback: $e.run,
				command: 'my-component/command',
				method: 'e:run',
			} ] );
		} );

		QUnit.test( 'runHashCommands(): Ensure callbacks performed', ( assert ) => {
			// Arrange.
			const eOrig = $e.run;

			let ensureCallbackPerformed = '';

			$e.run = ( command ) => ensureCallbackPerformed = command;

			// Act.
			$e.runHashCommands( [ {
				callback: $e.run,
				command: 'ensure-value',
				method: 'e:run',
			} ] );

			// Assert.
			assert.equal( 'ensure-value', ensureCallbackPerformed );

			// Cleanup.
			$e.run = eOrig;
		} );
	} );
} );
