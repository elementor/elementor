import WpDashboardTracking from '../wp-dashboard-tracking';
import BaseTracking from './base-tracking';

const PLUGIN_TYPE = {
	ELEMENTOR: 'core',
	ELEMENTOR_PRO: 'pro',
};

class PluginActions extends BaseTracking {
	static selectedReason = null;

	static init() {
		this.attachCoreDeactivationTracking();
		this.attachProDeactivationTracking();
		this.attachProDeletionTracking();
	}

	static attachCoreDeactivationTracking() {
		const dialogForm = document.querySelector( '#elementor-deactivate-feedback-dialog-form' );

		if ( ! dialogForm ) {
			return;
		}

		this.addEventListenerTracked(
			dialogForm,
			'change',
			( event ) => {
				const target = event.target;

				if ( target.classList.contains( 'elementor-deactivate-feedback-dialog-input' ) ) {
					this.selectedReason = target.value;
				}
			},
		);

		this.observeModalButtons();
	}

	static attachProDeactivationTracking() {
		const pluginsTable = document.querySelector( '.plugins' );

		if ( ! pluginsTable ) {
			return;
		}

		this.addEventListenerTracked(
			pluginsTable,
			'click',
			( event ) => {
				const link = event.target.closest( 'a' );

				if ( link && 'deactivate-elementor-pro' === link.id ) {
					this.trackProDeactivation();
				}
			},
			{ capture: true },
		);
	}

	static observeModalButtons() {
		const checkAndAttachDelegation = () => {
			const modal = document.querySelector( '#elementor-deactivate-feedback-modal' );

			if ( ! modal ) {
				return false;
			}

			this.addEventListenerTracked(
				modal,
				'click',
				( event ) => {
					const submitButton = event.target.closest( '.dialog-submit' );
					const skipButton = event.target.closest( '.dialog-skip' );

					if ( submitButton ) {
						this.trackCoreDeactivation( 'submit&deactivate' );
					} else if ( skipButton ) {
						this.trackCoreDeactivation( 'skip&deactivate' );
					}
				},
				{ capture: true },
			);

			return true;
		};

		if ( checkAndAttachDelegation() ) {
			return;
		}

		this.addObserver(
			document.body,
			{
				childList: true,
				subtree: true,
			},
			( mutations, observer ) => {
				if ( checkAndAttachDelegation() ) {
					observer.disconnect();
				}
			},
		);
	}

	static getUserInput() {
		const reasonsWithInput = [ 'found_a_better_plugin', 'other' ];

		if ( ! this.selectedReason || ! reasonsWithInput.includes( this.selectedReason ) ) {
			return null;
		}

		const inputField = document.querySelector( `input[name="reason_${ this.selectedReason }"]` );

		if ( inputField && inputField.value ) {
			return inputField.value;
		}

		return null;
	}

	static trackCoreDeactivation( action ) {
		const properties = {
			deactivate_form_submit: action,
			deactivate_plugin_type: PLUGIN_TYPE.ELEMENTOR,
		};

		if ( this.selectedReason ) {
			properties.deactivate_feedback_reason = this.selectedReason;
		}

		const userInput = this.getUserInput();
		if ( userInput ) {
			properties.deactivate_feedback_reason += `/${ userInput }`;
		}

		WpDashboardTracking.dispatchEvent( 'wpdash_deactivate_plugin', properties, { send_immediately: true } );
	}

	static trackProDeactivation() {
		this.trackProAction( 'deactivate' );
	}

	static attachProDeletionTracking() {
		if ( 'undefined' === typeof jQuery ) {
			return;
		}

		jQuery( document ).on( 'wp-plugin-deleting', ( event, args ) => {
			if ( 'elementor-pro' === args?.slug ) {
				this.trackProAction( 'delete' );
			}
		} );
	}

	static destroy() {
		if ( 'undefined' !== typeof jQuery ) {
			jQuery( document ).off( 'wp-plugin-deleting' );
		}

		BaseTracking.destroy.call( this );
	}

	static trackProAction( action ) {
		const eventMap = {
			deactivate: {
				eventName: 'wpdash_deactivate_plugin',
				propertyKey: 'deactivate_plugin_type',
			},
			delete: {
				eventName: 'wpdash_delete_plugin',
				propertyKey: 'plugin_delete',
			},
		};

		const config = eventMap[ action ];

		if ( ! config ) {
			return;
		}

		const properties = {
			[ config.propertyKey ]: PLUGIN_TYPE.ELEMENTOR_PRO,
		};

		WpDashboardTracking.dispatchEvent( config.eventName, properties, { send_immediately: true } );
	}
}

export default PluginActions;

