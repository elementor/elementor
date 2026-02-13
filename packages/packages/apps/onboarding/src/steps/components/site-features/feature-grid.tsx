import * as React from 'react';
import { ArrowRightIcon, CheckIcon, CrownFilledIcon } from '@elementor/icons';
import { Box, Chip, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export interface FeatureOption {
	id: string;
	label: string;
	Icon: React.ElementType;
	isPro: boolean;
}

interface ExploreMoreOption extends FeatureOption {
	id: 'explore_more';
	isExploreMore: true;
}

interface FeatureCardProps {
	isSelected: boolean;
	isExploreMore?: boolean;
	isCore?: boolean;
}

const BUILT_IN_CHIP_LABEL = __( 'Built-in', 'elementor' );

interface SelectionBadgeProps {
	isPro: boolean;
}

interface FeatureGridProps {
	options: FeatureOption[];
	selectedValues: string[];
	onFeatureClick: ( id: string ) => void;
	onExploreMoreClick: () => void;
}

const SELECTION_BADGE_SIZE = 18;
const SELECTION_BADGE_OFFSET = -6;
const SELECTION_BADGE_ICON_SIZE = 14;

const EXPLORE_MORE_OPTION: ExploreMoreOption = {
	id: 'explore_more',
	label: __( 'Explore more', 'elementor' ),
	Icon: ArrowRightIcon,
	isPro: false,
	isExploreMore: true,
};

const BuiltInChip = styled( Chip )( ( { theme } ) => ( {
	position: 'absolute',
	top: '6px',
	left: '6px',
	height: 18,
	display: 'none',
	'& .MuiChip-label': {
		fontSize: 12,
		paddingLeft: '8px',
		paddingRight: '8px',
		paddingTop: '3px',
		paddingBottom: '3px',
	},
	[ theme.breakpoints.up( 'md' ) ]: {
		display: 'inline-flex',
	},
} ) );

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
	borderRadius: '50%',
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
		! [ 'isSelected', 'isExploreMore', 'isCore' ].includes(
			prop as string
		),
} )< FeatureCardProps >( ( { theme, isSelected, isExploreMore, isCore } ) => ( {
	position: 'relative',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	aspectRatio: '1',
	minHeight: theme.spacing( 12 ),
	padding: theme.spacing( 2 ),
	borderRadius: theme.spacing( 1 ),
	border: isSelected
		? '2px solid #1F2124'
		: `1px solid ${ theme.palette.divider }`,
	cursor: isCore ? 'default' : 'pointer',
	transition: 'border-color 0.2s ease, background-color 0.2s ease',
	...( ! isCore && {
		'&:hover': {
			backgroundColor: theme.palette.action.hover,
		},
	} ),
	...( isExploreMore && {
		'& .feature-icon': {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: theme.spacing( 3.75 ),
			borderRadius: '50%',
			backgroundColor: theme.palette.text.primary,
			color: theme.palette.background.paper,
			aspectRatio: 1,
		},
	} ),
} ) );

export function FeatureGrid( {
	options,
	selectedValues,
	onFeatureClick,
	onExploreMoreClick,
}: FeatureGridProps ) {
	const handleKeyDown = (
		event: React.KeyboardEvent,
		handler: () => void
	) => {
		if ( [ 'Enter', ' ' ].includes( event.key ) ) {
			event.preventDefault();
			handler();
		}
	};

	return (
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
			{ options.map( ( option ) => {
				const isSelected = selectedValues.includes( option.id );
				const Icon = option.Icon;
				const BadgeIcon = option.isPro ? CrownFilledIcon : CheckIcon;
				const isCore = ! option.isPro;

				const handleClick = () => onFeatureClick( option.id );

				return (
					<FeatureCard
						key={ option.id }
						isSelected={ isSelected }
						isCore={ isCore }
						onClick={ isCore ? undefined : handleClick }
						role={ isCore ? undefined : 'button' }
						tabIndex={ isCore ? undefined : 0 }
						onKeyDown={
							isCore
								? undefined
								: ( event: React.KeyboardEvent ) =>
										handleKeyDown( event, handleClick )
						}
						aria-pressed={ isCore ? undefined : isSelected }
					>
						{ isCore && (
							<BuiltInChip
								label={ BUILT_IN_CHIP_LABEL }
								size="small"
							/>
						) }
						{ isSelected && (
							<SelectionBadge isPro={ option.isPro }>
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
				onClick={ onExploreMoreClick }
				role="button"
				tabIndex={ 0 }
				onKeyDown={ ( event: React.KeyboardEvent ) =>
					handleKeyDown( event, onExploreMoreClick )
				}
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
	);
}
