import { Box, Button, Chip, Paper, Stack, TextField, Typography, styled } from '@elementor/ui';

export const PlannerRoot = styled( Paper )( ( { theme } ) => ( {
	position: 'relative',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	overflow: 'hidden',
	borderRadius: theme.spacing( 1 ),
	border: '1px solid',
	borderColor: 'divider',
	minHeight: theme.spacing( 26.75 ),
} ) );

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
	width: theme.spacing( 31.5 ),
	height: '100%',
	marginLeft: theme.spacing( -8 ),
	[ theme.breakpoints.up( 'md' ) ]: {
		display: 'flex',
	},
} ) );

export const PlannerPreviewInner = styled( Box )( ( { theme } ) => ( {
	position: 'relative',
	width: theme.spacing( 31.5 ),
	height: theme.spacing( 18.5 ),
} ) );

export const PlannerPreviewFrame = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	inset: 0,
	border: '1px dashed',
	borderColor: '#696199',
	borderRadius: theme.spacing( 1.75 ),
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	gap: '3.7px',
	padding: '8.5px',
	paddingInlineEnd: '0',
} ) );

export const PlannerPreviewImage1 = styled( Box )( ( { theme } ) => ( {
	height: '121px',
	width: 'auto',
	objectFit: 'cover',
	borderRadius: theme.spacing( 1.25 ),
	flexShrink: 0,
} ) );

export const PlannerPreviewImage2 = styled( Box )( ( { theme } ) => ( {
	height: '121px',
	width: 'auto',
	objectFit: 'cover',
	borderRadius: theme.spacing( 1.25 ),
	flexShrink: 0,
	marginInlineEnd: '-1px',
} ) );

export const PlannerLoaderBadge = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	top: theme.spacing( -1.5 ),
	right: theme.spacing( -1.5 ),
} ) );

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

export const PlannerHeading = styled( Typography )( ( { theme } ) => ( {
	fontFamily: '"Poppins", sans-serif',
	fontWeight: 400,
	fontSize: theme.spacing( 3 ),
	lineHeight: theme.spacing( 6 ),
	letterSpacing: '0.15px',
	background: 'linear-gradient(77deg, #212121 25.85%, #696199 46.02%, #C945C9 60.81%, #212121 82.38%)',
	backgroundClip: 'text',
	WebkitBackgroundClip: 'text',
	WebkitTextFillColor: 'transparent',
} ) );

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
		width: theme.spacing( 50 ),
	},
	'& .MuiOutlinedInput-root': {
		borderRadius: theme.spacing( 1 ),
		height: theme.spacing( 5 ),
		boxShadow: '0px 3px 14px 0px rgba(0, 0, 0, 0.06)',
		overflow: 'hidden',
		'& fieldset': {
			borderColor: theme.palette.text.primary,
		},
		'&.Mui-focused fieldset': {
			borderColor: theme.palette.text.primary,
			borderWidth: '2px',
		},
	},
	'& .MuiInputBase-input': {
		border: 'none',
		borderRadius: 0,
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
	borderRadius: theme.spacing( 0.75 ),
	textTransform: 'none',
	fontWeight: 500,
	fontSize: theme.spacing( 1.625 ),
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
	borderRadius: theme.spacing( 1 ),
	textTransform: 'none',
	fontWeight: 500,
	whiteSpace: 'nowrap',
	'&:hover': {
		backgroundColor: theme.palette.primary.dark,
		color: theme.palette.primary.contrastText,
	},
} ) );

export const SuggestionChip = styled( Chip )( ( { theme } ) => ( {
	cursor: 'pointer',
	backgroundColor: theme.palette.common.white,
	borderColor: theme.palette.divider,
	color: theme.palette.text.secondary,
	fontSize: theme.spacing( 1.625 ),
} ) );
