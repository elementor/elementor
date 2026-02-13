import { Box, styled } from '@elementor/ui';

// One-off brand color from design (Figma onboarding 2026).
const GREETING_BANNER_BG_COLOR = '#fae4fa';

export const GreetingBannerRoot = styled( Box )( ( { theme } ) => ( {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	paddingInline: theme.spacing( 3 ),
	paddingBlock: theme.spacing( 1.5 ),
	borderRadius: 16,
	backgroundColor: GREETING_BANNER_BG_COLOR,
	alignSelf: 'flex-start',
} ) );
