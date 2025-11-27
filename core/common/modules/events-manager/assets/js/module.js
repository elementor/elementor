import eventsConfig from './events-config';
import mixpanel from 'mixpanel-browser';
import { TIERS } from 'elementor-utils/tiers';

export default class extends elementorModules.Module {
	trackingEnabled = false;
	#sessionRecordingInProgress = false;

	onInit() {
		this.config = eventsConfig;

		mixpanel.init(
			elementorCommon.config.editor_events?.token,
			{
				persistence: 'localStorage',
				autocapture: false,
				record_sessions_percent: 0,
				record_idle_timeout_ms: 60000,
				record_max_ms: 300000,
				record_mask_text_selector: '',
				flags: true,
			},
		);

		if ( elementorCommon.config.editor_events?.can_send_events ) {
			this.enableTracking();
		}
	}

	enableTracking() {
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
		if ( ! elementorCommon.config.editor_events?.can_send_events ) {
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

	startSessionRecording() {
		if ( ! elementorCommon.config.editor_events?.can_send_events || this.isSessionRecordingInProgress() ) {
			return;
		}

		if ( ! this.trackingEnabled ) {
			this.enableTracking();
		}

		mixpanel.start_session_recording();
		this.setSessionRecordingInProgress( true );
	}

	stopSessionRecording() {
		if ( ! elementorCommon.config.editor_events?.can_send_events || ! this.isSessionRecordingInProgress() ) {
			return;
		}

		mixpanel.stop_session_recording();
		this.setSessionRecordingInProgress( false );
	}

	setSessionRecordingInProgress( value ) {
		if ( 'boolean' !== typeof value ) {
			return;
		}

		this.#sessionRecordingInProgress = value;
	}

	isSessionRecordingInProgress() {
		return this.#sessionRecordingInProgress;
	}

	async getExperimentVariant( experimentName, defaultValue = 'control' ) {
		try {
			if ( ! mixpanel ) {
				return defaultValue;
			}

			if ( ! this.trackingEnabled ) {
				return defaultValue;
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
}
