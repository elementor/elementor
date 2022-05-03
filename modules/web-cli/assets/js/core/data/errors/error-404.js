import BaseError from './base-error';
import { consoleWarn } from 'elementor/modules/dev-tools/assets/js/utils';

export class Error404 extends BaseError {
	static getHTTPErrorCode() {
		return 404;
	}

	notify() {
		consoleWarn( this.message );
	}
}

export default Error404;
