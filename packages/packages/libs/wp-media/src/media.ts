import { WpMediaNotAvailableError } from './errors';
import { type WpMediaWindow } from './types/wp-media';

const wpMediaWindow = window as unknown as WpMediaWindow;

export default () => {
	if ( ! wpMediaWindow.wp?.media ) {
		throw new WpMediaNotAvailableError();
	}

	return wpMediaWindow.wp.media;
};
