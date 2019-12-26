import Callbacks from 'elementor-api/modules/callbacks';
import CallableBase from 'elementor-api/modules/callable-base';

jQuery( () => {
	QUnit.module( 'File: core/common/assets/js/api/modules/callbacks.js', () => {
		QUnit.module( 'Callbacks', () => {
			QUnit.test( 'checkId()', ( assert ) => {
				const random = Math.random(),
					fakeCallbacks = class extends Callbacks {
						getType() {
							return 'hook';
						}
					},
					fakeCallback = class extends CallableBase {
						getType() {
							return 'hook';
						}

						getId() {
							return random.toString();
						}

						getCommand() {
							return 'test/command';
						}

						register() {}
					},
					callbacks = new fakeCallbacks(),
					callableBase = new fakeCallback();

				assert.throws(
					() => {
						callbacks.register( 'after', callableBase );
						callbacks.register( 'after', callableBase );
					},
					new Error( `id: '${ random.toString() }' is already in use.` )
				);
			} );
		} );
	} );
} );
