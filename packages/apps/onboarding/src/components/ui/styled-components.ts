import { Box, styled, Typography } from '@elementor/ui';

const GREETING_BANNER_BG_COLOR_LIGHT = '#fae4fa';
const GREETING_BANNER_BG_COLOR_DARK = '#491146';

export const StepTitle = styled( Typography )( {
	fontWeight: 500,
	fontFamily: 'Poppins',
} );

export const GreetingBannerRoot = styled( Box )( ( { theme } ) => ( {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	paddingInline: theme.spacing( 3 ),
	paddingBlock: theme.spacing( 1.5 ),
	borderRadius: 16,
	backgroundColor: theme.palette.mode === 'dark' ? GREETING_BANNER_BG_COLOR_DARK : GREETING_BANNER_BG_COLOR_LIGHT,
	alignSelf: 'flex-start',
} ) );
