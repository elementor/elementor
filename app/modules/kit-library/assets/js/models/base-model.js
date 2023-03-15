export default class BaseModel {
	/**
	 * Clone to object to avoid changing the reference.
	 *
	 * @return {BaseModel} cloned model
	 */
	clone() {
		const instance = new this.constructor();

		Object.keys( this ).forEach( ( key ) => {
			instance[ key ] = this[ key ];
		} );

		return instance;
	}

	/**
	 * Using init and not the default constructor because there is a problem to fill the instance
	 * dynamically in the constructor.
	 *
	 * @param {*} data
	 * @return {BaseModel} model
	 */
	init( data = {} ) {
		Object.entries( data ).forEach( ( [ key, value ] ) => {
			this[ key ] = value;
		} );

		return this;
	}
}
