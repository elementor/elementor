import eventsConfig from './events-config';
import mixpanel from 'mixpanel-browser';
import { TIERS } from 'elementor-utils/tiers';

export default class extends elementorModules.Module {
	trackingEnabled = false;

	onInit() {
		this.config = eventsConfig;

		if ( ! this.canSendEvents() ) {
			return;
		}

		this.initializeMixpanel( () => this.enableTracking() );
	}

	initializeMixpanel( onLoaded ) {
		mixpanel.init(
			elementorCommon.config.editor_events?.token,
			{
				persistence: 'localStorage',
				autocapture: false,
				flags: true,
				api_hosts: {
					flags: 'https://api-eu.mixpanel.com',
				},
				loaded: onLoaded,
			},
		);
	}

	enableTracking() {
		if ( ! this.isMixpanelReady() ) {
			return;
		}

		const userId = elementorCommon.config.library_connect?.user_id;

		if ( userId ) {
			mixpanel.identify( userId );

			mixpanel.register( {
				appType: 'Editor',
			} );

			mixpanel.people.set_once( {
				$user_id: userId,
				$last_login: new Date().toISOString(),
				$plan_type: elementorCommon.config.library_connect?.plan_type || TIERS.free,
			} );
		}

		this.trackingEnabled = true;
	}

	dispatchEvent( name, data, options = {} ) {
		if ( ! this.canSendEvents() ) {
			return;
		}

		if ( ! this.trackingEnabled ) {
			this.enableTracking();
		}

		const eventData = {
			user_id: elementorCommon.config.library_connect?.user_id || null,
			user_roles: elementorCommon.config.library_connect?.user_roles || [],
			subscription_id: elementorCommon.config.editor_events?.subscription_id || null,
			user_tier: elementorCommon.config.library_connect?.current_access_tier || null,
			url: elementorCommon.config.editor_events?.site_url,
			wp_version: elementorCommon.config.editor_events?.wp_version,
			client_id: elementorCommon.config.editor_events?.site_key,
			app_version: elementorCommon.config.editor_events?.elementor_version,
			site_language: elementorCommon.config.editor_events?.site_language,
			...data,
		};

		mixpanel.track( name, eventData, options );
	}

	async featureFlagIsActive( flagName ) {
		if ( 'function' !== typeof mixpanel?.flags?.is_enabled ) {
			return false;
		}

		const isEnabled = await mixpanel.flags.is_enabled( flagName, false );
		return true === isEnabled;
	}

	async getExperimentVariant( experimentName, defaultValue = 'control' ) {
		try {
			if ( ! this.canSendEvents() ) {
				return defaultValue;
			}

			const isAbTestingEnabled = elementorCommon.config.editor_events?.flags_enabled ?? false;

			if ( ! isAbTestingEnabled ) {
				return defaultValue;
			}

			if ( ! mixpanel ) {
				return defaultValue;
			}

			if ( ! this.trackingEnabled ) {
				this.enableTracking();
			}

			if ( ! mixpanel.flags ) {
				return defaultValue;
			}

			if ( 'function' !== typeof mixpanel.flags.get_variant_value ) {
				return defaultValue;
			}

			const variant = await mixpanel.flags.get_variant_value( experimentName, defaultValue );

			if ( undefined === variant || null === variant ) {
				return defaultValue;
			}

			return variant;
		} catch ( error ) {
			return defaultValue;
		}
	}

	startExperiment( experimentName, experimentVariant ) {
		if ( ! this.trackingEnabled ) {
			return;
		}

		mixpanel.track( '$experiment_started', { 'Experiment name': experimentName, 'Variant name': experimentVariant } );
	}

	isMixpanelReady() {
		if ( 'undefined' === typeof mixpanel || ! mixpanel ) {
			return false;
		}

		try {
			const distinctId = mixpanel.get_distinct_id();
			return distinctId !== undefined && distinctId !== null;
		} catch ( error ) {
			return false;
		}
	}

	canSendEvents() {
		return !! elementorCommon?.config?.editor_events?.can_send_events;
	}
}
