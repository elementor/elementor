import { useTheme } from '@elementor/ui';

import { getElementorFrontendConfig } from '../sync/get-elementor-globals';

export function useDirection() {
	const theme = useTheme();

	const isUiRtl = 'rtl' === theme.direction,
		isSiteRtl = !! getElementorFrontendConfig()?.is_rtl;

	return { isSiteRtl, isUiRtl };
}
