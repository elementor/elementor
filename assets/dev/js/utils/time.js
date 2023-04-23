/**
 * Returns the timestamp in ISO8601 format with the UTC timezone offset.
 *
 * @since 3.6.0
 *
 * @param {Date} date
 * @return {Date} timestamp
 */
export default function getUserTimestamp( date = new Date() ) {
	const timezoneOffset = date.getTimezoneOffset();

	// Local time for the user
	let UTCTimestamp = new Date( date.getTime() - ( timezoneOffset * 60000 ) ).toISOString();

	// Remove the Z suffix from the string.
	UTCTimestamp = UTCTimestamp.slice( 0, -1 );

	// Create the offset string in the format `+HH:00` (or minus (-) prefix for negative offset instead of plus)
	const decimalTimezoneOffset = timezoneOffset / 60,
		// Negative offsets include a '-' sign in the getTimezoneOffset value, positive values need a '+' prefix (ISO8601).
		sign = 0 <= decimalTimezoneOffset ? '+' : '-',
		hours = Math.abs( Math.floor( decimalTimezoneOffset ) ),
		minutes = Math.abs( decimalTimezoneOffset % 1 ) * 60,
		addZeroToHour = 10 > ( hours ) ? '0' : '',
		addZeroToMinutes = 10 > ( minutes ) ? '0' : '';

	const formattedTimezoneOffset = sign + addZeroToHour + hours + ':' + addZeroToMinutes + minutes;

	return UTCTimestamp + formattedTimezoneOffset;
}
