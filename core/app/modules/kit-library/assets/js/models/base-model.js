export default class BaseModel {
	clone() {
		const instance = new this.constructor();

		Object.keys( this ).forEach( ( key ) => {
			instance[ key ] = this[ key ];
		} );

		return instance;
	}
}
