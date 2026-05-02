import { getElementorFrontendConfig } from '@elementor/editor-v1-adapters';
import { useTheme } from '@elementor/ui';

export function useDirection() {
	const theme = useTheme();

	const isUiRtl = 'rtl' === theme.direction,
		isSiteRtl = !! getElementorFrontendConfig()?.is_rtl;

	return { isSiteRtl, isUiRtl };
}
