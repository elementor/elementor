import { getAngieIframe } from '@elementor-external/angie-sdk';

export const isAngieAvailable = () => {
	return !! getAngieIframe();
};
