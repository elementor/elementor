import BaseError from './base-error';

export class Error404 extends BaseError {
	static getHTTPErrorCode() {
		return 404;
	}

	notify() {
		elementorDevToolsModule.consoleWarn( this.message );
	}
}

export default Error404;
