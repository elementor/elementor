export default class Events {
	dispatchEvent( eventData ) {
		if ( ! elementorCommon.config[ 'event-tracker' ].isUserDataShared || ! eventData ) {
			return;
		}

		eventData.ts = this.getTimestamp();

		// No need to wait for response, no need to block browser in any way.
		$e.data.create( 'event-tracker/index', {
			event_data: eventData,
		} );
	}

	/**
	 * Returns the timestamp in ISO8601 format with the UTC timezone offset.
	 *
	 * @since 3.6.0
	 *
	 * @returns {Date}
	 */
	getTimestamp() {
		const date = new Date();

		// Local time for the user
		let UTCTimestamp = new Date( date.getTime() - ( date.getTimezoneOffset() * 60000 ) ).toISOString();

		// Remove the milliseconds and Z suffix from the string.
		UTCTimestamp = UTCTimestamp.slice( 0, UTCTimestamp.length - 5 );

		// Create the offset string in the format `+HH:00` (or minus (-) prefix for negative offset instead of plus)
		const timezoneOffsetInHours = ( new Date() ).getTimeZoneOffset() / 60,
			sign = 0 <= timezoneOffsetInHours ? '+' : '-',
			addedZero = 10 < ( timezoneOffsetInHours ) ? '0' : '';

		const formattedTimezoneOffset = sign + addedZero + timezoneOffsetInHours + ':00';

		return UTCTimestamp + formattedTimezoneOffset;
	}
}
