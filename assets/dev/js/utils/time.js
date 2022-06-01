/**
 * Returns the timestamp in ISO8601 format with the UTC timezone offset.
 *
 * @since 3.6.0
 *
 * @returns {Date}
 */
export default function getUserTimestamp() {
	const date = new Date(),
		timezoneOffset = date.getTimezoneOffset();

	// Local time for the user
	let UTCTimestamp = new Date( date.getTime() - ( timezoneOffset * 60000 ) ).toISOString();

	// Remove the Z suffix from the string.
	UTCTimestamp = UTCTimestamp.slice( 0, -1 );

	// Create the offset string in the format `+HH:00` (or minus (-) prefix for negative offset instead of plus)
	const timezoneOffsetInHours = timezoneOffset / 60,
		// Negative offsets include a '-' sign in the getTimezoneOffset value, positive values need a '+' prefix (ISO8601).
		sign = 0 <= timezoneOffsetInHours ? '+' : '',
		addedZero = 10 < ( timezoneOffsetInHours ) ? '0' : '';

	const formattedTimezoneOffset = sign + addedZero + timezoneOffsetInHours + ':00';

	return UTCTimestamp + formattedTimezoneOffset;
}
