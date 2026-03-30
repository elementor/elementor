import eventsConfig from './events-config';
import mixpanel, { Mixpanel } from 'mixpanel-browser';
import { TIERS } from 'elementor-utils/tiers';

/** @type {Mixpanel | null} */
let mixpanelInstance = null;

const RECORD_SESSION_PERCENT = 1;

function shouldRecordSession( distinctId, percent ) {
	const fraction = Math.min( Math.max( percent / 100, 0 ), 1 );
	let hash = 0;
	for ( let i = 0; i < distinctId.length; i++ ) {
		// eslint-disable-next-line no-bitwise
		hash = ( ( hash * 31 ) + distinctId.charCodeAt( i ) ) >>> 0;
	}
	return ( hash / 4294967295 ) < fraction;
}

export default class extends elementorModules.Module {
	trackingEnabled = false;
	sessionRecordingStartEvent = null;
	sessionRecordingEndEvent = null;
	isRecording = false;

	onInit() {
		this.config = eventsConfig;

		if ( ! this.canSendEvents() ) {
			return;
		}

		this.initializeMixpanel( () => this.enableTracking() );
	}

	initializeMixpanel( onLoaded ) {
		if ( mixpanelInstance && mixpanelInstance.isInitialized ) {
			onLoaded( mixpanelInstance );
		} else {
			mixpanelInstance = mixpanel.init(
				elementorCommon.config.editor_events?.token,
				{
					persistence: 'localStorage',
					autocapture: false,
					flags: true,
					api_hosts: {
						flags: 'https://api-eu.mixpanel.com',
					},
					loaded: onLoaded,
					record_sessions_percent: 0,
					record_idle_timeout_ms: 60 * 1000, // 60 Seconds
					record_min_ms: 5 * 1000, // 5 Seconds
					record_max_ms: 30 * 1000, // 30 Seconds
					record_mask_text_selector: '',
				},
				'elementor-editor',
			);
		}
		elementorCommon.config.editor_events.mixpanelInstance = mixpanelInstance;
	}

	enableTracking() {
		if ( ! this.isMixpanelReady() ) {
			return;
		}

		const userId = elementorCommon.config.library_connect?.user_id;

		mixpanelInstance.register( {
			appType: 'Editor',
		} );

		if ( userId ) {
			mixpanelInstance.identify( userId );

			mixpanelInstance.people.set_once( {
				$user_id: userId,
				$last_login: new Date().toISOString(),
				$plan_type: elementorCommon.config.library_connect?.plan_type || TIERS.free,
			} );
		}

		this.trackingEnabled = true;
	}

	configureSessionRecording( startEvent, endEvent = null ) {
		if ( 'string' !== typeof startEvent || ! startEvent ) {
			return;
		}

		this.sessionRecordingStartEvent = startEvent;
		this.sessionRecordingEndEvent = endEvent;
	}

	dispatchEvent( name, data, options = {} ) {
		if ( ! this.canSendEvents() ) {
			return;
		}

		if ( ! this.trackingEnabled ) {
			this.enableTracking();
		}

		if ( name === this.sessionRecordingStartEvent ) {
			const distinctId = mixpanelInstance.get_distinct_id();
			if ( shouldRecordSession( distinctId, RECORD_SESSION_PERCENT ) ) {
				mixpanelInstance.start_session_recording();
				this.isRecording = true;
			} else {
				this.isRecording = false;
			}
		} else if ( name === this.sessionRecordingEndEvent && this.isRecording ) {
			mixpanelInstance.stop_session_recording();
			this.isRecording = false;
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
			session_recording: this.isRecording,
			...data,
		};

		mixpanelInstance.track( name, eventData, options );
	}

	async featureFlagIsActive( flagName ) {
		if ( 'function' !== typeof mixpanelInstance?.flags?.is_enabled ) {
			return false;
		}

		const isEnabled = await mixpanelInstance.flags.is_enabled( flagName, false );
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

			if ( ! mixpanelInstance ) {
				return defaultValue;
			}

			if ( ! this.trackingEnabled ) {
				this.enableTracking();
			}

			if ( ! mixpanelInstance.flags ) {
				return defaultValue;
			}

			if ( 'function' !== typeof mixpanelInstance.flags.get_variant_value ) {
				return defaultValue;
			}

			const variant = await mixpanelInstance.flags.get_variant_value( experimentName, defaultValue );

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

		mixpanelInstance.track( '$experiment_started', { 'Experiment name': experimentName, 'Variant name': experimentVariant } );
	}

	isMixpanelReady() {
		if ( 'undefined' === typeof mixpanelInstance || ! mixpanelInstance ) {
			return false;
		}

		try {
			const distinctId = mixpanelInstance.get_distinct_id();
			return distinctId !== undefined && distinctId !== null;
		} catch ( error ) {
			return false;
		}
	}

	canSendEvents() {
		return !! elementorCommon?.config?.editor_events?.can_send_events;
	}

	getMixpanelInstance() {
		return this.isMixpanelReady() ? mixpanelInstance : undefined;
	}
}
