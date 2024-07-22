export default function createModel( attributes ) {
	return {
		attributes,
		get( key ) {
			return this.attributes[ key ];
		},
		set( key, value ) {
			this.attributes[ key ] = value;
		},
	};
}
