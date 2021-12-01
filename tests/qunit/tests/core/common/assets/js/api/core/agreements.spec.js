import ComponentBase from 'elementor-api/modules/component-base';
import CommandAgreement from 'elementor-api/modules/command-agreement';

let component;

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/core/agreements.js', ( hooks ) => {
		hooks.before( () => {
			component = new class Component extends ComponentBase {
				getNamespace() {
					return 'agreements-hooks-test';
				}
			};

			const Command = class Test extends CommandAgreement {
				getDefaultAgreement( args = {} ) {
					return () => {
						return { test: true };
					};
				}
			};

			component.agreements = component.importCommands( { Command } );

			$e.components.register( component );
		} );

		hooks.after( () => {
			delete $e.components.components[ component.getNamespace() ];
		} );

		QUnit.test( 'Sanity', ( assert ) => {
			// Arrange.
			$e.hooks.data.deactivate();

			// Act.
			const actual = $e.agreements.run( 'agreements-hooks-test/command' );

			// Assert that actual has the default agreement.
			assert.deepEqual( actual, { test: true } );

			// Cleanup.
			$e.hooks.data.activate();
		} );

		QUnit.test( 'Ensure unknown hooks are not registered.', ( assert ) => {
			// Arrange.
			const agreement = new class extends ( $e.modules.hookData.Agreement ) {
				getCommand() {
					return 'agreements-hooks-test/command';
				}

				getId() {
					return 'agreements-hooks-test-hook-not-agreed';
				}
			};

			// Assert.
			assert.throws(
				() => {
					// Act.
					$e.hooks.registerDataAgreement( agreement );
				},
				new Error( 'Agreement not agreed: agreements-hooks-test-hook-not-agreed' )
			);
		} );

		QUnit.test( 'Agreements should give the latest result by favor of Agreement hooks', ( assert ) => {
            // Arrange.
			// Register new agreements to the component.
			const totalAgreements = 3,
				Agreements = [];

			for ( let i = 0; i < totalAgreements; i++ ) {
				Agreements.push( new class extends ( $e.modules.hookData.Agreement ) {
					getCommand() {
						return 'agreements-hooks-test/command';
					}

					getId() {
						return 'agreements-hooks-test-hook' + i;
					}

					apply() {
						const disableDefaultAgreement = new $e.modules.HookAgreement();

						disableDefaultAgreement.newAgreement = ( args, result ) => {
							if ( result ) {
								result.index++;

								return result;
							}

							return {
								test: true,
								index: 0,
							};
						};

						return disableDefaultAgreement;
					}
				} );
			}

			const fakeAgreed = [],
				agreedOrig = $e.agreements.agreed;

			$e.agreements.agreed = () => {
				return fakeAgreed;
			};

			// Register the agreement.
			Agreements.forEach( ( hook ) => {
				// Hacking agreed hooks.
				$e.hooks.data.agreed = fakeAgreed.push( hook.getId() );

				$e.hooks.registerDataAgreement( hook );
			} );

			// Act.
			const actual = $e.agreements.run( 'agreements-hooks-test/command' );

			// Assert.
			assert.deepEqual( actual, {
                test: true,
                index: totalAgreements - 1,
            } );

			// Cleanup.
			$e.agreements.agreed = agreedOrig;
		} );
	} );
} );
