module.exports = {
	isObject: ( value ) => value && 'object' === typeof value && value.constructor === Object,

	/**
	 * @param {Object} tested   e.g. { heading: { title: 'Hello World' } }
	 * @param {Object} expected e.g. { heading: { controls: { title: 'Hello World' } } }
	 * @return {{
	 * 	testedWidgetsCount: number,
	 * 	expectedWidgetsCount: number,
	 * 	testedControlsCount: number,
	 * 	expectedControlsCount: number,
	 * }}
	 */
	summary: ( tested, expected ) => {
		const testedWidgetsCount = Object.keys( tested ).length,
			expectedWidgetsCount = Object.keys( expected ).length;

		const testedControlsCount = Object.values( tested ).reduce( ( acc, controls ) => {
			return acc + Object.keys( controls ).length;
		}, 0 );

		const expectedControlsCount = Object.values( expected ).reduce( ( acc, element ) => {
			return acc + Object.keys( element.controls ).length;
		}, 0 );

		return {
			testedWidgetsCount,
			expectedWidgetsCount,
			testedControlsCount,
			expectedControlsCount,
		};
	},
};
