export default class ArgsObject {
	static [Symbol.hasInstance]( obj ) {
		/**
		 * This is function extending being called each time JS uses instanceOf, since babel use it each time it create new class
		 * its give's opportunity to mange capabilities of instanceOf operator.
		 * saving current class each time will give option later to handle instanceOf for grant parents.
		 * Important: For the mechanism to get working the CLASS should have 'getInstanceType function'.
		 */
		const result = super[ Symbol.hasInstance ]( obj );

		if ( result && obj ) {
			const name = this.getInstanceType ? this.getInstanceType() : 'Anonymous_' + new Date().getTime();

			if ( ! obj.instanceTypes ) {
				obj.instanceTypes = [];
			}

			if ( -1 === obj.instanceTypes.indexOf( name ) ) {
				obj.instanceTypes.push( name );
			}
		}

		return result;
	}

	static getInstanceType() {
		return 'ArgsObject';
	}

	/**
	 * Function constructor().
	 *
	 * Create ArgsObject.
	 *
	 * @param {{}} args
	 */
	constructor( args ) {
		this.args = args;

		if ( ! this.instanceTypes ) {
			this.instanceTypes = [];
		}
	}

	/**
	 * Function requireArgument().
	 *
	 * Validate property in args.
	 *
	 * @param {string} property
	 * @param {{}} args
	 *
	 * @throws {Error}
	 *
	 */
	requireArgument( property, args = this.args ) {
		if ( ! args.hasOwnProperty( property ) ) {
			throw Error( `${ property } is required.` );
		}
	}

	/**
	 * Function requireArgumentType().
	 *
	 * Validate property in args using `type === typeof(args.whatever)`.
	 *
	 * @param {string} property
	 * @param {string} type
	 * @param {{}} args
	 *
	 * @throws {Error}
	 *
	 */
	requireArgumentType( property, type, args = this.args ) {
		this.requireArgument( property, args );

		if ( ( typeof args[ property ] !== type ) ) {
			throw Error( `${ property } invalid type: ${ type }.` );
		}
	}

	/**
	 * Function requireArgumentInstance().
	 *
	 * Validate property in args using `args.whatever instanceof instance`.
	 *
	 * @param {string} property
	 * @param {instanceof} instance
	 * @param {{}} args
	 *
	 * @throws {Error}
	 *
	 */
	requireArgumentInstance( property, instance, args = this.args ) {
		this.requireArgument( property, args );

		if ( ! ( args[ property ] instanceof instance ) ) {
			throw Error( `${ property } invalid instance.` );
		}
	}

	/**
	 * Function requireArgumentConstructor().
	 *
	 * Validate property in args using `type === args.whatever.constructor`.
	 *
	 * @param {string} property
	 * @param {*} type
	 * @param {{}} args
	 *
	 * @throws {Error}
	 *
	 */
	requireArgumentConstructor( property, type, args = this.args ) {
		this.requireArgument( property, args );

		if ( args[ property ].constructor !== type ) {
			throw Error( `${ property } invalid constructor type.` );
		}
	}
}
