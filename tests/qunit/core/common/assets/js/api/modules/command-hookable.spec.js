import CommandHookable from 'elementor-api/modules/command-hookable';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/command-hookable.js', () => {
		QUnit.module( 'CommandHookable', () => {
			QUnit.test( 'onCatchApply()', ( assert ) => {
				const random = Math.random().toString();

				assert.throws(
					() => {
						const instance = new CommandHookable( {} );

						instance.onBeforeApply = () => {
							throw new Error( random );
						};

						const origDevTools = $e.devTools;

						// Use `$e.devTools` as a hack.
						$e.devTools = {
							log: { error: ( e ) => {
									$e.devTools = origDevTools;
									throw e;
								} },
						};

						instance.run( {} );

						$e.devTools = origDevTools;
					},
					new Error( random )
				);
			} );

			QUnit.test( 'run(): on catch apply', ( assert ) => {
				const random = Math.random().toString();

				assert.throws(
					() => {
						const instance = new CommandHookable( {} );

						instance.onBeforeApply = () => {
							throw new Error( random );
						};

						instance.onCatchApply = ( e ) => {
							throw e;
						};

						instance.run( {} );
					},
					new Error( random )
				);
			} );
		} );
	} );
} );

