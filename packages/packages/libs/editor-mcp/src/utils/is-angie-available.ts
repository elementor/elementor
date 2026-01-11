import { getAngieIframe } from '@elementor-external/angie-sdk';

export const isAngieAvailable = (): boolean => {
	return !! getAngieIframe();
};
