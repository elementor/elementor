import InstanceType from './instance-type';
import isInstanceof from '../../editor/utils/is-instanceof';

export default class ArgsObject extends InstanceType {
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
		super();

		this.args = args;
	}

	/**
	 * Function requireArgument().
	 *
	 * Validate property in args.
	 *
	 * @param {string} property
	 * @param {{}}     args
	 *
	 * @throws {Error}
	 *
	 */
	requireArgument( property, args = this.args ) {
		if ( ! Object.prototype.hasOwnProperty.call( args, property ) ) {
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
	 * @param {{}}     args
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
	 * @param {*}      instance
	 * @param {{}}     args
	 *
	 * @throws {Error}
	 *
	 */
	requireArgumentInstance( property, instance, args = this.args ) {
		this.requireArgument( property, args );

		if ( ! ( args[ property ] instanceof instance ) && ! isInstanceof( args[ property ], instance ) ) {
			throw Error( `${ property } invalid instance.` );
		}
	}

	/**
	 * Function requireArgumentConstructor().
	 *
	 * Validate property in args using `type === args.whatever.constructor`.
	 *
	 * @param {string} property
	 * @param {*}      type
	 * @param {{}}     args
	 *
	 * @throws {Error}
	 *
	 */
	requireArgumentConstructor( property, type, args = this.args ) {
		this.requireArgument( property, args );

		// Note: Converting the constructor to string in order to avoid equation issues
		// due to different memory addresses between iframes (window.Object !== window.top.Object).
		if ( args[ property ].constructor.toString() !== type.prototype.constructor.toString() ) {
			throw Error( `${ property } invalid constructor type.` );
		}
	}
}
