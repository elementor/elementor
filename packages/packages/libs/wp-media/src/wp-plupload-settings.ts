import { WpPluploadSettingsNotAvailableError } from './errors';
import { type WpPluploadSettingsWindow } from './types/plupload';

const wpPluploadSettingsWindow = window as unknown as WpPluploadSettingsWindow;

export default () => {
	if ( ! wpPluploadSettingsWindow._wpPluploadSettings ) {
		throw new WpPluploadSettingsNotAvailableError();
	}

	return wpPluploadSettingsWindow._wpPluploadSettings;
};
