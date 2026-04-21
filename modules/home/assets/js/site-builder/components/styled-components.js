import { Box, Button, Chip, Paper, Stack, TextField, Typography, styled } from '@elementor/ui';

export const PlannerRoot = styled( Paper )( ( { theme } ) => ( {
	position: 'relative',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	overflow: 'hidden',
	borderRadius: theme.spacing( 1 ),
	border: '1px solid',
	borderColor: theme.palette.divider,
	minHeight: theme.spacing( 26.75 ),
	gap: theme.spacing( 2 ),
} ) );

export const PlannerBackground = styled( Box )( ( { bgimage } ) => ( {
	position: 'absolute',
	inset: 0,
	background: [
		'radial-gradient(ellipse at 100% 0%, #e8b4f0 0%, #f0d4f8 20%, #f5eafc 40%, transparent 65%)',
		'radial-gradient(ellipse at 0% 100%, #d8d8ee 0%, #e8e8f5 25%, transparent 55%)',
		'linear-gradient(135deg, #f0f0f8 0%, #f8f4fc 50%, #faf0fc 100%)',
	].join( ', ' ),
	...( bgimage && {
		backgroundImage: `url(${ bgimage })`,
		backgroundPosition: '0px -105.625px',
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
	} ),
	zIndex: 0,
} ) );

export const PlannerGrid = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	inset: 0,
	backgroundImage:
		'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
	backgroundSize: `${ theme.spacing( 5 ) } ${ theme.spacing( 5 ) }`,
	zIndex: 0,
} ) );

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
	top: theme.spacing( 1 ),
	right: theme.spacing( -2.5 ),
} ) );

export const PlannerContent = styled( Stack )( ( { theme } ) => ( {
	position: 'relative',
	zIndex: 1,
	flex: 1,
	gap: theme.spacing( 1 ),
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
	letterSpacing: '0.15px',
	background: 'linear-gradient(89deg, #212121 25.85%, #696199 46.02%, #C945C9 60.81%, #212121 82.38%)',
	backgroundClip: 'text',
	WebkitBackgroundClip: 'text',
	WebkitTextFillColor: 'transparent',
	alignSelf: 'flex-start',
} ) );

PlannerHeading.defaultProps = {
	variant: 'h4',
};

export const PlannerInputRow = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	gap: theme.spacing( 1 ),
	alignItems: 'stretch',
	flexWrap: 'wrap',
	marginBlockStart: theme.spacing( 1 ),
	[ theme.breakpoints.up( 'sm' ) ]: {
		flexDirection: 'row',
		alignItems: 'center',
	},
} ) );

export const PlannerInputColumn = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	gap: theme.spacing( 2 ),
	alignItems: 'flex-start',
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
			borderColor: theme.palette.divider,
		},
		'&.Mui-focused fieldset': {
			borderColor: theme.palette.divider,
			borderWidth: '1px',
		},
	},
	'& .MuiInputBase-input': {
		border: 'none',
		borderRadius: 0,
		height: '100%',
		paddingInline: theme.spacing( 2 ),
	},
} ) );

export const PlannerChipsRow = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	gap: theme.spacing( 1 ),
	flexWrap: 'wrap',
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
	border: '1px solid',
	borderColor: theme.palette.text.primary,
	color: theme.palette.common.white,
	borderRadius: theme.spacing( 1 ),
	textTransform: 'none',
	whiteSpace: 'nowrap',
	width: 'max-content',
	'&:hover, &:focus': {
		backgroundColor: '#22252a',
		borderColor: '#22252a',
		color: theme.palette.common.white,
	},
	'&&.Mui-disabled': {
		borderColor: theme.palette.action.disabledBackground,
	},
} ) );

export const SuggestionChip = styled( Chip )( ( { theme, selected } ) => ( {
	cursor: selected ? 'default' : 'pointer',
	backgroundColor: selected ? theme.palette.text.secondary : theme.palette.common.white,
	borderColor: selected ? 'none' : theme.palette.divider,
	color: selected ? theme.palette.common.white : theme.palette.text.secondary,
	fontSize: theme.spacing( 1.625 ),
	'&&:hover': {
		backgroundColor: theme.palette.text.secondary,
		color: theme.palette.common.white,
		borderColor: 'none',
	},
} ) );

export const LayoutToggleContainer = styled( Box )( ( { theme } ) => ( {
	alignItems: 'center',
	backgroundColor: theme.palette.common.white,
	borderRadius: theme.spacing( 3 ),
	display: 'inline-flex',
	width: 'fit-content',
} ) );

export const LayoutChip = styled( Chip, {
	shouldForwardProp: ( prop ) => 'isSelected' !== prop,
} )( ( { theme, isSelected } ) => ( {
	backgroundColor: isSelected ? theme.palette.secondary.main : 'transparent',
	border: 'none',
	borderRadius: theme.spacing( 12.5 ),
	color: isSelected ? theme.palette.secondary.contrastText : theme.palette.text.primary,
	height: 'initial',
	padding: `${ theme.spacing( 0.375 ) } ${ theme.spacing( 1.25 ) }`,
	'& .MuiChip-label': {
		fontSize: theme.typography.caption.fontSize,
		fontWeight: isSelected ? 500 : 400,
		paddingInlineStart: theme.spacing( 0.5 ),
		paddingInlineEnd: theme.spacing( 0.5 ),
	},
	'&& .MuiChip-icon': {
		fontSize: theme.spacing( 1.75 ),
	},
} ) );
