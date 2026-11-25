import { getAngieIframe } from '@elementor/editor-angie-sdk';

export const isAngieAvailable = (): boolean => {
	return !! getAngieIframe();
};
