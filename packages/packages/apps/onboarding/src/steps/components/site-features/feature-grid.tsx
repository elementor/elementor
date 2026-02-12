import * as React from 'react';
import { useCallback } from 'react';
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
		! [ 'isSelected', 'isExploreMore', 'isCore' ].includes( prop as string ),
} )< FeatureCardProps >( ( { theme, isSelected, isExploreMore, isCore } ) => ( {
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
	cursor: isCore && isSelected ? 'not-allowed' : 'pointer',
	transition: 'border-color 0.2s ease, background-color 0.2s ease',
	...( ! ( isCore && isSelected ) && {
		'&:hover': {
			backgroundColor: theme.palette.action.hover,
		},
	} ),
	...( isCore && isSelected && {
		opacity: 0.7,
	} ),
	...( isExploreMore && {
		'& .feature-icon': {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: 30,
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
	const handleKeyDown = useCallback(
		( e: React.KeyboardEvent, handler: () => void ) => {
			if ( 'Enter' === e.key || ' ' === e.key ) {
				e.preventDefault();
				handler();
			}
		},
		[]
	);

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
				const isDisabled = isCore && isSelected;

				const handleClick = () => {
					if ( ! isDisabled ) {
						onFeatureClick( option.id );
					}
				};

				return (
					<FeatureCard
						key={ option.id }
						isSelected={ isSelected }
						isCore={ isCore }
						onClick={ handleClick }
						role="button"
						tabIndex={ 0 }
						onKeyDown={ ( e: React.KeyboardEvent ) =>
							handleKeyDown( e, handleClick )
						}
						aria-pressed={ isSelected }
						aria-disabled={ isDisabled }
					>
						{ isCore && (
							<Chip
								label={ BUILT_IN_CHIP_LABEL }
								size="small"
								sx={ {
									position: 'absolute',
									top: '6px',
									left: '6px',
									height: 18,
									display: { xs: 'none', md: 'inline-flex' },
									'& .MuiChip-label': {
										fontSize: 12,
										px: '8px',
										py: '3px',
									},
								} }
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
				onKeyDown={ ( e: React.KeyboardEvent ) =>
					handleKeyDown( e, onExploreMoreClick )
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
