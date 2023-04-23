import BaseError from './base-error';

export class DefaultError extends BaseError {
	static getHTTPErrorCode() {
		return 501;
	}
}

export default DefaultError;
