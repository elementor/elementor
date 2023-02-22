import BaseError from './base-error';
import Console from 'elementor-api/utils/console';

export class Error404 extends BaseError {
	static getHTTPErrorCode() {
		return 404;
	}

	notify() {
		Console.warn( this.message );
	}
}

export default Error404;
