import * as React from 'react';
import { CheckIcon, CrownFilledIcon } from '@elementor/icons';
import { Box, styled, Typography, useTheme } from '@elementor/ui';

import { SelectionBadge } from '../../../components/ui/selection-badge';
import { t } from '../../../utils/translations';
import { ProPlanNotice } from './pro-plan-notice';

export interface FeatureOption {
	id: string;
	labelKey: string;
	Icon: React.ElementType;
	licenseType: 'installable' | 'pro' | 'one';
}

interface FeatureCardProps {
	isSelected: boolean;
}

interface FeatureGridProps {
	options: FeatureOption[];
	selectedValues: string[];
	onFeatureClick: ( id: string ) => void;
}

const FeatureCard = styled( Box, {
	shouldForwardProp: ( prop ) => ! [ 'isSelected' ].includes( prop as string ),
} )< FeatureCardProps >( ( { theme, isSelected } ) => ( {
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
	cursor: 'pointer',
	transition: 'border-color 0.2s ease, background-color 0.2s ease',
	'&:hover': {
		backgroundColor: theme.palette.action.hover,
	},
} ) );

export function FeatureGrid( { options, selectedValues, onFeatureClick }: FeatureGridProps ) {
	const theme = useTheme();

	const isPaid = ( licenseType: FeatureOption[ 'licenseType' ] ) => licenseType === 'pro' || licenseType === 'one';

	const selectedPaidFeatures = selectedValues.filter( ( id ) => {
		const featureOption = options.find( ( item ) => item.id === id );
		return featureOption && isPaid( featureOption.licenseType );
	} );

	const shouldDisplayProPlanNotice = selectedPaidFeatures.length > 0;

	const planName: 'Pro' | 'One' = selectedPaidFeatures.some( ( id ) => {
		const featureOption = options.find( ( item ) => item.id === id );
		return featureOption?.licenseType === 'one';
	} )
		? 'One'
		: 'Pro';

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
					sm: 'repeat(4, 140px)',
					md: 'repeat(5, 140px)',
				},
				gap: 2,
				width: '100%',
			} }
		>
			{ options.map( ( option ) => {
				const isSelected = selectedValues.includes( option.id );
				const Icon = option.Icon;
				const isOptionPaid = isPaid( option.licenseType );
				const BadgeIcon = isOptionPaid ? CrownFilledIcon : CheckIcon;

				const handleClick = () => onFeatureClick( option.id );

				const handleKeyDownEvent = ( event: React.KeyboardEvent ) => handleKeyDown( event, handleClick );

				return (
					<FeatureCard
						key={ option.id }
						data-testid={ `feature-card-${ option.id }` }
						isSelected={ isSelected }
						onClick={ handleClick }
						role="button"
						tabIndex={ 0 }
						onKeyDown={ handleKeyDownEvent }
						aria-pressed={ isSelected }
					>
						{ isSelected && (
							<SelectionBadge icon={ BadgeIcon } variant={ isOptionPaid ? 'paid' : 'free' } />
						) }
						<Box
							className="feature-icon"
							display="flex"
							alignItems="center"
							justifyContent="center"
							color="primary.dark"
							fontSize={ theme.spacing( 4 ) }
							height={ theme.spacing( 4 ) }
							sx={ { mt: 2, mb: 1 } }
						>
							<Icon fontSize="inherit" />
						</Box>
						<Typography
							variant="body2"
							color="text.secondary"
							display="flex"
							alignItems="center"
							align="center"
							sx={ { minHeight: theme.spacing( 5 ) } }
						>
							{ t( option.labelKey ) }
						</Typography>
					</FeatureCard>
				);
			} ) }

			{ shouldDisplayProPlanNotice && <ProPlanNotice planName={ planName } /> }
		</Box>
	);
}
