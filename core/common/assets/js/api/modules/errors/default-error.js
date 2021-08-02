import BaseError from './base-error';

export class DefaultError extends BaseError {
	static getStatus() {
		return 0;
	}
}

export default DefaultError;
