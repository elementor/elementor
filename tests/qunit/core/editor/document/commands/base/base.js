import Base from '../../../../../../../assets/dev/js/editor/document/commands/base/base';

jQuery( () => {
	QUnit.module( 'File: editor/document/dynamic/commands/base/base', () => {
		QUnit.module( 'Base', () => {
			QUnit.test( 'constructor(): without containers', ( assert ) => {
				assert.throws(
					() => {
						const instance = new Base( { } );

						instance.requireContainer();
					},
					new Error( 'container or containers are required.' )
				);
			} );

			QUnit.test( 'constructor(): with container & containers', ( assert ) => {
				assert.throws(
					() => {
						const instance = new Base( {
							container: {},
							containers: [],
						} );

						instance.requireContainer();
					},
					new Error( 'container and containers cannot go together please select one of them.' )
				);
			} );

			QUnit.test( 'apply(): force method implementation', ( assert ) => {
				assert.throws(
					() => {
						const instance = new Base( {} );

						instance.apply( {} );
					},
					new Error( 'Base.apply() should be implemented, please provide \'apply\' functionality.' )
				);
			} );

			QUnit.test( 'run(): on catch apply', ( assert ) => {
				const random = Math.random().toString();

				assert.throws(
					() => {
						const instance = new Base( {} );

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

			QUnit.test( 'onCatchApply()', ( assert ) => {
				const random = Math.random().toString();

				assert.throws(
					() => {
						const instance = new Base( {} );

						instance.onBeforeApply = () => {
							throw new Error( random );
						};

						$e.devTools = {
							log: { error: ( e ) => {
									throw e;
								} },
						};

						instance.run( {} );
					},
					new Error( random )
				);

				$e.devTools = undefined;
			} );
		} );
	} );
} );

