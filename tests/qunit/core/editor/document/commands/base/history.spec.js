import History from 'elementor-document/commands/base/history';

jQuery( () => {
	QUnit.module( 'File: editor/document/commands/base/history', () => {
		QUnit.module( 'History', () => {
			QUnit.test( 'getHistory(): force method implementation', ( assert ) => {
				assert.throws(
					() => {
						const instance = new History( {} );

						instance.getHistory( {} );
					},
					new Error( 'History.getHistory() should be implemented, please provide \'getHistory\' functionality.' )
				);
			} );
		} );

		QUnit.test( 'onCatchApply()`', ( assert ) => {
			const fakeHistory = class extends History {
				// eslint-disable-next-line no-unused-vars
				getHistory( args ) {
					return true;
				}
			},
				instance = new fakeHistory( {} );

			instance.historyId = Math.random();

			let tempCommand = '',
				tempArgs = '';

			$e.commandsInternal.on( 'run', ( component, command, args ) => {
				tempCommand = command;
				tempArgs = args;
			} );

			// Use `instance.historyId` for error.
			try {
				instance.onCatchApply( new $e.modules.HookBreak( instance.id ) );
			} catch ( e ) {
				assert.equal( e, instance.historyId );
			}

			assert.equal( tempCommand, 'document/history/delete-log' );
			assert.equal( tempArgs.id, instance.historyId );
		} );
	} );
} );

