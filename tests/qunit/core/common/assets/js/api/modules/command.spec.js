import Command from 'elementor-api/modules/command';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/command.js', () => {
		QUnit.module( 'Command', () => {
			QUnit.test( 'run(): on catch apply', ( assert ) => {
				const random = Math.random().toString();

				assert.throws(
					() => {
						const instance = new Command( {} );

						instance.apply = () => {
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
						const instance = new Command( {} );

						instance.apply = () => {
							throw new Error( random );
						};

						instance.run( {} );
					},
					new Error( random )
				);
			} );
		} );
	} );
} );

