import BaseError from './base-error';

export class NotFoundError extends BaseError {
	static getStatus() {
		return 404;
	}

	notify() {
		elementorCommon.helpers.consoleWarn( this.message );
	}
}

export default NotFoundError;
