import * as React from 'react';
import { useCallback, useMemo } from 'react';
import {
	ArrowRightIcon,
	BriefcaseIcon,
	CheckIcon,
	CrownFilledIcon,
	GridDotsIcon,
	InfoCircleIcon,
	ListIcon,
	LockFilledIcon,
	MapPinIcon,
	Menu2Icon,
	MessageLinesIcon,
	RepeatIcon,
	SwipeIcon,
} from '@elementor/icons';
import { Box, Button, Stack, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const EXPLORE_FEATURES_URL =
	'https://elementor.com/features/?utm_source=onboarding&utm_medium=wp-dash';
const COMPARE_PLANS_URL =
	'https://elementor.com/pricing/?utm_source=onboarding&utm_medium=wp-dash';

interface FeatureOption {
	id: string;
	label: string;
	Icon: React.ElementType;
	isPro?: boolean;
}

interface ExploreMoreOption extends FeatureOption {
	id: 'explore_more';
	isExploreMore: true;
}

interface FeatureCardProps {
	isSelected: boolean;
	isExploreMore?: boolean;
}

interface SiteFeaturesProps {
	selectedValues: string[];
	onChange: ( values: string[] ) => void;
}

const STEP_TITLE_SX = {
	color: '#0C0D0E',
	textAlign: 'center',
	fontFamily: "'Poppins', sans-serif",
	fontSize: 24,
	fontWeight: 500,
	lineHeight: 1.33,
	letterSpacing: 0,
	fontFeatureSettings: "'liga' off, 'clig' off",
};

const FEATURE_OPTIONS: FeatureOption[] = [
	{
		id: 'posts',
		label: __( 'Posts', 'elementor' ),
		Icon: ListIcon,
	},
	{
		id: 'form',
		label: __( 'Form', 'elementor' ),
		Icon: MessageLinesIcon,
		isPro: true,
	},
	{
		id: 'gallery',
		label: __( 'Gallery', 'elementor' ),
		Icon: GridDotsIcon,
		isPro: true,
	},
	{
		id: 'slides',
		label: __( 'Slides', 'elementor' ),
		Icon: SwipeIcon,
		isPro: false,
	},
	{
		id: 'loop_carousel',
		label: __( 'Loop carousel', 'elementor' ),
		Icon: RepeatIcon,
		isPro: true,
	},
	{
		id: 'hotspot',
		label: __( 'Hotspot', 'elementor' ),
		Icon: MapPinIcon,
		isPro: true,
	},
	{
		id: 'portfolio',
		label: __( 'Portfolio', 'elementor' ),
		Icon: BriefcaseIcon,
		isPro: true,
	},
	{
		id: 'login',
		label: __( 'Login', 'elementor' ),
		Icon: LockFilledIcon,
		isPro: true,
	},
	{
		id: 'mega_menu',
		label: __( 'Mega menu', 'elementor' ),
		Icon: Menu2Icon,
		isPro: true,
	},
];

const EXPLORE_MORE_OPTION: ExploreMoreOption = {
	id: 'explore_more',
	label: __( 'Explore more', 'elementor' ),
	Icon: ArrowRightIcon,
	isExploreMore: true,
};

const SELECTION_BADGE_SIZE = 18;
const SELECTION_BADGE_OFFSET = -6;
const SELECTION_BADGE_ICON_SIZE = 14;

interface SelectionBadgeProps {
	isPro: boolean;
}

const SelectionBadge = styled( Box, {
	shouldForwardProp: ( prop ) => 'isPro' !== prop,
} )< SelectionBadgeProps >( ( { theme, isPro } ) => ( {
	position: 'absolute',
	top: SELECTION_BADGE_OFFSET,
	right: SELECTION_BADGE_OFFSET,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: SELECTION_BADGE_SIZE,
	height: SELECTION_BADGE_SIZE,
	borderRadius: 25,
	backgroundColor: isPro
		? theme.palette.promotion.main
		: theme.palette.text.primary,
	color: theme.palette.common.white,
	'& .MuiSvgIcon-root': {
		fontSize: SELECTION_BADGE_ICON_SIZE,
	},
} ) );

const FeatureCard = styled( Box, {
	shouldForwardProp: ( prop ) =>
		! [ 'isSelected', 'isExploreMore' ].includes( prop as string ),
} )< FeatureCardProps >( ( { theme, isSelected, isExploreMore } ) => ( {
	position: 'relative',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	aspectRatio: '1',
	minHeight: 96,
	padding: theme.spacing( 2 ),
	borderRadius: 8,
	border: isSelected
		? '2px solid #1F2124'
		: `1px solid ${ theme.palette.divider }`,
	cursor: 'pointer',
	transition: 'border-color 0.2s ease, background-color 0.2s ease',
	'&:hover': {
		backgroundColor: theme.palette.action.hover,
	},
	...( isExploreMore && {
		'& .feature-icon': {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: 40,
			height: 40,
			borderRadius: '50%',
			backgroundColor: theme.palette.text.primary,
			color: theme.palette.background.paper,
		},
	} ),
} ) );

const PRO_PLAN_NOTICE_BG = 'rgba(250, 228, 250, 0.6)';

const ProPlanNotice = styled( Box )( () => ( {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
	padding: '8px 17px',
	borderRadius: 8,
	backgroundColor: PRO_PLAN_NOTICE_BG,
} ) );

const PRO_FEATURE_IDS = new Set(
	FEATURE_OPTIONS.filter( ( o ) => o.isPro ).map( ( o ) => o.id )
);

export function SiteFeatures( {
	selectedValues,
	onChange,
}: SiteFeaturesProps ) {
	const handleFeatureClick = useCallback(
		( id: string ) => {
			if ( id === EXPLORE_MORE_OPTION.id ) {
				return;
			}

			const isSelected = selectedValues.includes( id );
			const nextValues = isSelected
				? selectedValues.filter( ( v ) => v !== id )
				: [ ...selectedValues, id ];

			onChange( nextValues );
		},
		[ selectedValues, onChange ]
	);

	const hasProSelection = useMemo(
		() => selectedValues.some( ( id ) => PRO_FEATURE_IDS.has( id ) ),
		[ selectedValues ]
	);

	const handleExploreMoreClick = useCallback( () => {
		window.open( EXPLORE_FEATURES_URL, '_blank' );
	}, [] );

	const handleComparePlansClick = useCallback( () => {
		window.open( COMPARE_PLANS_URL, '_blank' );
	}, [] );

	return (
		<Stack spacing={ 4 } width="100%">
			<Stack spacing={ 1 } textAlign="center" alignItems="center">
				<Typography component="h2" sx={ STEP_TITLE_SX }>
					{ __(
						'What do you want to include in your site?',
						'elementor'
					) }
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{ __(
						"We'll use this to tailor suggestions for you.",
						'elementor'
					) }
				</Typography>
			</Stack>

			<Box
				sx={ {
					display: 'grid',
					gridTemplateColumns: {
						xs: 'repeat(3, 1fr)',
						sm: 'repeat(5, 1fr)',
					},
					gap: 2,
					width: '100%',
				} }
			>
				{ FEATURE_OPTIONS.map( ( option ) => {
					const isSelected = selectedValues.includes( option.id );
					const Icon = option.Icon;
					const BadgeIcon = option.isPro
						? CrownFilledIcon
						: CheckIcon;

					return (
						<FeatureCard
							key={ option.id }
							isSelected={ isSelected }
							onClick={ () => handleFeatureClick( option.id ) }
							role="button"
							tabIndex={ 0 }
							onKeyDown={ ( e: React.KeyboardEvent ) => {
								if ( 'Enter' === e.key || ' ' === e.key ) {
									e.preventDefault();
									handleFeatureClick( option.id );
								}
							} }
							aria-pressed={ isSelected }
						>
							{ isSelected && (
								<SelectionBadge isPro={ !! option.isPro }>
									<BadgeIcon />
								</SelectionBadge>
							) }
							<Box className="feature-icon" sx={ { mb: 1 } }>
								<Icon fontSize="medium" />
							</Box>
							<Typography
								variant="body2"
								color="text.secondary"
								textAlign="center"
							>
								{ option.label }
							</Typography>
						</FeatureCard>
					);
				} ) }
				<FeatureCard
					isSelected={ false }
					isExploreMore
					onClick={ handleExploreMoreClick }
					role="button"
					tabIndex={ 0 }
					onKeyDown={ ( e: React.KeyboardEvent ) => {
						if ( 'Enter' === e.key || ' ' === e.key ) {
							e.preventDefault();
							handleExploreMoreClick();
						}
					} }
				>
					<Box className="feature-icon" sx={ { mb: 1 } }>
						<EXPLORE_MORE_OPTION.Icon fontSize="small" />
					</Box>
					<Typography
						variant="body2"
						color="text.secondary"
						textAlign="center"
					>
						{ EXPLORE_MORE_OPTION.label }
					</Typography>
				</FeatureCard>
			</Box>

			{ hasProSelection && (
				<ProPlanNotice>
					<InfoCircleIcon
						sx={ { fontSize: 20, color: 'text.secondary' } }
					/>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={ { fontSize: 13 } }
					>
						{ __(
							'Some features you selected are available in Pro plan.',
							'elementor'
						) }
					</Typography>
					<Button
						variant="text"
						size="small"
						onClick={ handleComparePlansClick }
						sx={ {
							color: 'promotion.main',
							fontSize: 13,
							textTransform: 'none',
							padding: '4px 5px',
							minWidth: 'auto',
						} }
					>
						{ __( 'Compare plans', 'elementor' ) }
					</Button>
				</ProPlanNotice>
			) }
		</Stack>
	);
}
