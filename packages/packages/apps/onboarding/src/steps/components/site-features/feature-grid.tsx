import * as React from 'react';
import { ArrowRightIcon, CheckIcon, CrownFilledIcon } from '@elementor/icons';
import { Box, Chip, styled, Typography } from '@elementor/ui';

import { SelectionBadge } from '../../../components/ui/selection-badge';
import { t } from '../../../utils/translations';

export interface FeatureOption {
	id: string;
	labelKey: string;
	Icon: React.ElementType;
	licenseType: 'core' | 'pro' | 'one' | 'other';
}

interface ExploreMoreOption {
	id: 'explore_more';
	labelKey: string;
	Icon: React.ElementType;
	licenseType: 'other';
	isExploreMore: true;
}

interface FeatureCardProps {
	isSelected: boolean;
	isExploreMore?: boolean;
	isCore?: boolean;
}

interface FeatureGridProps {
	options: FeatureOption[];
	selectedValues: string[];
	onFeatureClick: ( id: string ) => void;
	onExploreMoreClick: () => void;
}

const EXPLORE_MORE_OPTION: ExploreMoreOption = {
	id: 'explore_more',
	labelKey: 'steps.site_features.explore_more',
	Icon: ArrowRightIcon,
	licenseType: 'other',
	isExploreMore: true,
};

const IncludedInCoreChip = styled( Chip )( ( { theme } ) => ( {
	position: 'absolute',
	insetBlockStart: theme.spacing( 0.75 ),
	insetInlineStart: theme.spacing( 0.75 ),
	height: theme.spacing( 2.25 ),
	'& .MuiChip-label': {
		fontSize: theme.spacing( 1.5 ),
		padding: `${ theme.spacing( 0.375 ) } ${ theme.spacing( 1 ) }`,
	},
} ) );

const FeatureCard = styled( Box, {
	shouldForwardProp: ( prop ) => ! [ 'isSelected', 'isExploreMore', 'isCore' ].includes( prop as string ),
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
	border: isSelected ? `2px solid ${ theme.palette.text.primary }` : `1px solid ${ theme.palette.divider }`,
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

interface ExploreMoreCardProps {
	onClick: () => void;
	onKeyDown: ( event: React.KeyboardEvent, handler: () => void ) => void;
}

function ExploreMoreCard( { onClick, onKeyDown }: ExploreMoreCardProps ) {
	return (
		<FeatureCard
			isSelected={ false }
			isExploreMore
			onClick={ onClick }
			role="button"
			tabIndex={ 0 }
			onKeyDown={ ( event: React.KeyboardEvent ) => onKeyDown( event, onClick ) }
		>
			<Box className="feature-icon" sx={ { mb: 1 } }>
				<EXPLORE_MORE_OPTION.Icon fontSize="small" />
			</Box>
			<Typography variant="body2" color="text.secondary" textAlign="center">
				{ t( EXPLORE_MORE_OPTION.labelKey ) }
			</Typography>
		</FeatureCard>
	);
}

export function FeatureGrid( { options, selectedValues, onFeatureClick, onExploreMoreClick }: FeatureGridProps ) {
	const handleKeyDown = ( event: React.KeyboardEvent, handler: () => void ) => {
		if ( [ 'Enter', ' ' ].includes( event.key ) ) {
			event.preventDefault();
			handler();
		}
	};

	return (
		<Box
			justifyContent="center"
			sx={ {
				display: 'grid',
				gridTemplateColumns: {
					xs: 'repeat(auto-fit, minmax(100px, 135px))',
					sm: 'repeat(4, 1fr)',
					md: 'repeat(5, 1fr)',
				},
				gap: 2,
				width: '100%',
			} }
		>
			{ options.map( ( option ) => {
				const isSelected = selectedValues.includes( option.id );
				const Icon = option.Icon;
				const BadgeIcon = option.licenseType !== 'core' ? CrownFilledIcon : CheckIcon;
				const isCore = option.licenseType === 'core';

				const handleClick = () => onFeatureClick( option.id );

				const handleKeyDownEvent = isCore
					? undefined
					: ( event: React.KeyboardEvent ) => handleKeyDown( event, handleClick );

				return (
					<FeatureCard
						key={ option.id }
						data-testid={ `feature-card-${ option.id }` }
						isSelected={ isSelected }
						isCore={ isCore }
						onClick={ isCore ? undefined : handleClick }
						role={ isCore ? undefined : 'button' }
						tabIndex={ isCore ? undefined : 0 }
						onKeyDown={ handleKeyDownEvent }
						aria-pressed={ isCore ? undefined : isSelected }
					>
						{ isCore && <IncludedInCoreChip label={ t( 'steps.site_features.included' ) } size="small" /> }
						{ isSelected && (
							<SelectionBadge
								icon={ BadgeIcon }
								variant={ option.licenseType !== 'core' ? 'paid' : 'free' }
							/>
						) }
						<Box className="feature-icon" sx={ { mb: 1 } }>
							<Icon fontSize="medium" />
						</Box>
						<Typography variant="body2" color="text.secondary" textAlign="center">
							{ t( option.labelKey ) }
						</Typography>
					</FeatureCard>
				);
			} ) }
			<ExploreMoreCard onClick={ onExploreMoreClick } onKeyDown={ handleKeyDown } />
		</Box>
	);
}
