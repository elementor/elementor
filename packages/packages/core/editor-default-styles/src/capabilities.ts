import { type UserCapabilities } from '@elementor/editor-styles-repository';

export const UPDATE_DEFAULT_STYLES_CAPABILITY_KEY = 'manage_options';

export const getCapabilities = (): UserCapabilities => {
	return {
		update: UPDATE_DEFAULT_STYLES_CAPABILITY_KEY,
		create: UPDATE_DEFAULT_STYLES_CAPABILITY_KEY,
		delete: UPDATE_DEFAULT_STYLES_CAPABILITY_KEY,
		updateProps: UPDATE_DEFAULT_STYLES_CAPABILITY_KEY,
	};
};
