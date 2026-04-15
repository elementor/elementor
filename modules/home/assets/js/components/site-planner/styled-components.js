import { Box, Button, Chip, Paper, Stack, TextField, Typography, styled } from '@elementor/ui';

export const PlannerRoot = styled( Paper )( {
	position: 'relative',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	overflow: 'hidden',
	borderRadius: '8px',
	border: '1px solid',
	borderColor: 'divider',
	minHeight: '214px',
} );

export const PlannerBackground = styled( Box )( ( { bgimage } ) => ( {
	position: 'absolute',
	inset: 0,
	backgroundImage: bgimage
		? `url(${ bgimage })`
		: 'linear-gradient(90deg, rgba(105, 97, 153, 0.08) 0%, rgba(201, 69, 201, 0.12) 100%)',
	backgroundPosition: '0px -105.625px',
	backgroundSize: bgimage ? '100% 257.593%' : 'auto',
	backgroundRepeat: 'no-repeat',
	zIndex: 0,
} ) );

export const PlannerGrid = styled( Box )( {
	position: 'absolute',
	inset: 0,
	backgroundImage:
		'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
	backgroundSize: '40px 40px',
	zIndex: 0,
} );

export const PlannerPreviewContainer = styled( Box )( ( { theme } ) => ( {
	position: 'relative',
	zIndex: 1,
	display: 'none',
	alignItems: 'center',
	justifyContent: 'center',
	flexShrink: 0,
	width: '252px',
	height: '100%',
	marginLeft: theme.spacing( -8 ),
	[ theme.breakpoints.up( 'md' ) ]: {
		display: 'flex',
	},
} ) );

export const PlannerPreviewInner = styled( Box )( {
	position: 'relative',
	width: '252px',
	height: '148px',
} );

export const PlannerPreviewFrame = styled( Box )( {
	position: 'absolute',
	inset: 0,
	border: '1px dashed',
	borderColor: '#696199',
	borderRadius: '14px',
	overflow: 'hidden',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '3.7px',
	padding: '8.5px',
} );

export const PlannerPreviewImage = styled( Box )( {
	height: '120px',
	width: '151px',
	objectFit: 'cover',
	borderRadius: '4px',
	flexShrink: 0,
} );

export const PlannerLoaderBadge = styled( Box )( {
	position: 'absolute',
	top: '-12px',
	right: '-12px',
} );

export const PlannerContent = styled( Stack )( ( { theme } ) => ( {
	position: 'relative',
	zIndex: 1,
	flex: 1,
	paddingBlock: theme.spacing( 3 ),
	paddingInline: theme.spacing( 3 ),
	[ theme.breakpoints.up( 'md' ) ]: {
		paddingInline: theme.spacing( 4 ),
	},
} ) );

export const PlannerHeading = styled( Typography )( {
	fontFamily: '"Poppins", sans-serif',
	fontWeight: 400,
	fontSize: '24px',
	lineHeight: '48px',
	letterSpacing: '0.15px',
	background: 'linear-gradient(77deg, #212121 25.85%, #696199 46.02%, #C945C9 60.81%, #212121 82.38%)',
	backgroundClip: 'text',
	WebkitBackgroundClip: 'text',
	WebkitTextFillColor: 'transparent',
} );

export const PlannerInputRow = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	gap: theme.spacing( 1 ),
	alignItems: 'stretch',
	[ theme.breakpoints.up( 'sm' ) ]: {
		flexDirection: 'row',
		alignItems: 'center',
	},
} ) );

export const PlannerTextField = styled( TextField )( ( { theme } ) => ( {
	width: '100%',
	[ theme.breakpoints.up( 'sm' ) ]: {
		width: '400px',
	},
	'& .MuiOutlinedInput-root': {
		backgroundColor: 'white',
		borderRadius: '8px',
		height: '40px',
		boxShadow: '0px 3px 14px 0px rgba(0, 0, 0, 0.06)',
		'& fieldset': {
			borderColor: '#212121',
		},
	},
} ) );

export const PlannerChipsRow = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	gap: theme.spacing( 1 ),
	flexWrap: 'wrap',
} ) );

export const SessionStatusCard = styled( Paper )( ( { theme } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	paddingBlock: theme.spacing( 3 ),
	paddingInline: theme.spacing( 3 ),
	gap: theme.spacing( 2 ),
	borderRadius: theme.spacing( 1 ),
	border: '1px solid',
	borderColor: theme.palette.divider,
	[ theme.breakpoints.up( 'md' ) ]: {
		paddingInline: theme.spacing( 4 ),
	},
} ) );

export const GenerateSiteButton = styled( Button )( ( { theme } ) => ( {
	backgroundColor: theme.palette.text.primary,
	color: theme.palette.common.white,
	borderRadius: '6px',
	textTransform: 'none',
	fontWeight: 500,
	fontSize: '13px',
	whiteSpace: 'nowrap',
	minWidth: 'auto',
	paddingBlock: theme.spacing( 0.25 ),
	paddingInline: theme.spacing( 1.5 ),
	'&:hover': {
		backgroundColor: theme.palette.text.secondary,
	},
} ) );

export const CreateSiteButton = styled( Button )( ( { theme } ) => ( {
	backgroundColor: theme.palette.text.primary,
	color: theme.palette.common.white,
	borderRadius: '8px',
	textTransform: 'none',
	fontWeight: 500,
	whiteSpace: 'nowrap',
	'&:hover': {
		backgroundColor: theme.palette.text.secondary,
	},
} ) );

export const SuggestionChip = styled( Chip )( ( { theme } ) => ( {
	cursor: 'pointer',
	backgroundColor: theme.palette.common.white,
	borderColor: theme.palette.divider,
	color: theme.palette.text.secondary,
	fontSize: '13px',
} ) );
