export default class Direction {
	static get( arr ) {
		const value = arr[ 0 ],
			isRtl = false; // elementorAppConfig.is_rtl

		let direction = 'start' === value && 'left' || 'end' === value && 'right';

		if ( isRtl && direction ) {
			direction = 'right' === direction ? 'left' : 'right';
		}

		return direction;
	}
}
