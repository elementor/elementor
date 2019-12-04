import Callbacks from 'elementor-common/components/base/callbacks';
import CallbackBase from 'elementor-document/callback/base/base';

jQuery( () => {
	QUnit.module( 'File: common/assets/js/components/base/callbacks.js', () => {
		QUnit.module( 'Callbacks', () => {
			QUnit.test( 'checkId()', ( assert ) => {
				const random = Math.random(),
					fakeCallbacks = class extends Callbacks {
						getType() {
							return 'hook';
						}
					},
					fakeCallback = class extends CallbackBase {
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
					callbackBase = new fakeCallback();

				assert.throws(
					() => {
						callbacks.register( 'after', callbackBase );
						callbacks.register( 'after', callbackBase );
					},
					new Error( `id: '${ random.toString() }' is already in use.` )
				);
			} );
		} );
	} );
} );
