import getUserTimestamp from 'elementor-utils/time';

export default class Events {
	dispatchEvent( eventData ) {
		if ( ! elementorCommon.config[ 'event-tracker' ].isUserDataShared || ! eventData ) {
			return;
		}

		eventData.ts = getUserTimestamp();

		// No need to wait for response, no need to block browser in any way.
		$e.data.create( 'event-tracker/index', {
			event_data: eventData,
		} );
	}
}
