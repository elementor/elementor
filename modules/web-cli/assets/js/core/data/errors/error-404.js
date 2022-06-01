import BaseError from './base-error';
import Helpers from 'elementor-api/utils/helpers';

export class Error404 extends BaseError {
	static getHTTPErrorCode() {
		return 404;
	}

	notify() {
		Helpers.consoleWarn( this.message );
	}
}

export default Error404;
