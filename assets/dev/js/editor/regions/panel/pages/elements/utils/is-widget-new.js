/**
 * Determines whether a widget should display the "New" badge in the panel.
 *
 * The badge shows when the current Elementor major.minor version is less than
 * or equal to the version the widget shipped in. Patch versions are ignored.
 *
 * @param {{ new_until_version?: string }} item           Widget config object.
 * @param {string}                         currentVersion Elementor version string (e.g. "4.3.1").
 * @return {boolean} Whether the "New" badge should be shown.
 */
export function isWidgetNew( item, currentVersion ) {
	const untilVersion = item.new_until_version;

	if ( ! untilVersion ) {
		return false;
	}

	const [ curMajor, curMinor ] = currentVersion.split( '.' ).map( Number );
	const [ untilMajor, untilMinor ] = untilVersion.split( '.' ).map( Number );

	return curMajor < untilMajor || ( curMajor === untilMajor && curMinor <= untilMinor );
}
