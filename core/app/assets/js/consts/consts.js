import getUserTimestamp from 'elementor-utils/time';

export const eventTrackingObject = {
	placement: 'apps',
	event: 'event_name',
	version: 'v1',
	details: {
		source: 'event_source',
		action: 'event_action',
		event_type: 'click',
		site_key: '{site_key}', // TODO: Add data
		// user_id: elementorAppConfig.user_id,
	},
	ts: getUserTimestamp,
};
