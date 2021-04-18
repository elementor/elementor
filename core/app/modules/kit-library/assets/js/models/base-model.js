export default class BaseModel {
	clone() {
		const instance = new this.constructor();

		Object.keys( this ).forEach( ( key ) => {
			instance[ key ] = this[ key ];
		} );

		return instance;
	}

	init( data = {} ) {
		Object.entries( data ).forEach( ( [ key, value ] ) => {
			this[ key ] = value;
		} );

		return this;
	}
}
