import BaseLoader from './base-loader.js';

export default class YoutubeLoader extends BaseLoader {
	getApiURL() {
		return 'https://www.youtube.com/iframe_api';
	}

	getURLRegex() {
		return /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?vi?=|(?:embed|v|vi|user|shorts)\/))([^?&"'>]+)/;
	}

	isApiLoaded() {
		return window.YT && YT.loaded;
	}

	getApiObject() {
		return YT;
	}
}

window.elementorFrontend = window.elementorFrontend || {};
window.elementorFrontend.utils = window.elementorFrontend.utils || {};
window.elementorFrontend.utils.youtube = new YoutubeLoader();
