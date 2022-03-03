const events = {
	dispatchEvent: ( eventData ) => {
		if ( ! elementorCommon.config[ 'event-tracker' ].isUserDataShared || ! eventData ) {
			return;
		}

		// No need to wait for response, no need to block browser in any way.
		$e.data.create( 'event-tracker/index', {
			event_data: eventData,
		} );
	},
};

export default events;
