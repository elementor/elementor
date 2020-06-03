import BaseLoader from './base-loader';

export default class YoutubeLoader extends BaseLoader {
	getApiURL() {
		return 'https://www.youtube.com/iframe_api';
	}

	getURLRegex() {
		return /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?vi?=|(?:embed|v|vi|user)\/))([^?&"'>]+)/;
	}

	isApiLoaded() {
		return window.YT && YT.loaded;
	}

	getApiObject() {
		return YT;
	}
}
