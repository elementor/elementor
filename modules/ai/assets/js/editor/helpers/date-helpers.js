export const MONTH_DECEMBER_INDEX = 12;
export const MONTH_JANUARY_INDEX = 0;
/**
 * Formats a date (like wp_date() in PHP), translating it into site's locale.
 *
 * @param {string}                       format   PHP-style formatting string.
 * @param {Date | string | undefined}    date     Date object
 * @param {string | number | undefined=} timezone Timezone to output result in or a UTC offset. Defaults to timezone from site.
 * @return {string}
 */
export const translateDate = ( format, date, timezone ) => {
	const { dateI18n } = window.wp?.date;

	return dateI18n( format, date, timezone );
};

/**
 * Returns difference in days between two dates
 *
 * @param {Date} firstDate
 * @param {Date} secondDate
 * @return {number} Positive or negative number in days
 */
export const daysDiff = ( firstDate, secondDate ) => {
	const MS_PER_DAY = 1000 * 60 * 60 * 24;

	const firstUTC = Date.UTC( firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() );
	const secondUTC = Date.UTC( secondDate.getFullYear(), secondDate.getMonth(), secondDate.getDate() );

	return Math.floor( ( secondUTC - firstUTC ) / MS_PER_DAY );
};
