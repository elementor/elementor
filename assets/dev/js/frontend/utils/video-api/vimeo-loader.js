import BaseLoader from './base-loader';

export default class VimeoLoader extends BaseLoader {
	getApiURL() {
		return 'https://player.vimeo.com/api/player.js';
	}

	getURLRegex() {
		return /^(?:https?:\/\/)?(?:www|player\.)?(?:vimeo\.com\/)?(?:video\/)?(\d+)([^?&#"'>]?)/;
	}

	getExternalURLRegex() {
		return /^(?:https?:\/\/)?(?:www|player\.)?(?:vimeo\.com\/external\/)?(\d+)([^.]?)/;
	}

	isApiLoaded() {
		return window.Vimeo;
	}

	getApiObject() {
		return Vimeo;
	}
}
