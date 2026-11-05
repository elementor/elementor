import { ChevronDownIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { REDUCED_MOTION_SX, SCANNER_COLORS, SCANNER_LAYOUT, SCANNER_MOTION } from '../scanner-constants';
import { CheckTableHeader, TableCard } from './fix-table';

export const CollapsibleCardHeader = ( { count, title, isExpanded, isLoading, onToggle } ) => (
	<Stack
		direction="row"
		alignItems="center"
		justifyContent="space-between"
		gap={ 2 }
		p={ 2 }
		borderBottom={ isExpanded ? 1 : 0 }
		borderColor="divider"
	>
		<Stack direction="row" alignItems="center" gap={ 1 } flex={ 1 } minWidth={ 0 }>
			<Box
				width={ SCANNER_LAYOUT.countBadgeSize }
				height={ SCANNER_LAYOUT.countBadgeSize }
				borderRadius="50%"
				bgcolor={ SCANNER_COLORS.countBadge }
				display="flex"
				alignItems="center"
				justifyContent="center"
				flexShrink={ 0 }
			>
				<Typography variant="caption" color="text.secondary">{ count }</Typography>
			</Box>
			<Typography variant="subtitle2" color="text.primary">{ title }</Typography>
		</Stack>
		<Button
			variant="text"
			color="secondary"
			size="small"
			onClick={ onToggle }
			disabled={ isLoading }
			aria-expanded={ isExpanded }
			endIcon={ (
				<ChevronDownIcon
					sx={ {
						transform: isExpanded ? 'rotate(180deg)' : 'none',
						transition: `transform ${ SCANNER_MOTION.chevronMs }ms ${ SCANNER_MOTION.easeOutExpo }`,
						...REDUCED_MOTION_SX,
					} }
				/>
			) }
		>
			{ isExpanded ? __( 'Hide checks', 'elementor' ) : __( 'Show checks', 'elementor' ) }
		</Button>
	</Stack>
);

CollapsibleCardHeader.propTypes = {
	count: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	isExpanded: PropTypes.bool,
	isLoading: PropTypes.bool,
	onToggle: PropTypes.func.isRequired,
};

export const ChecksSummary = ( { checks, activationFixes, isExpanded, isLoading, onToggle, children } ) => (
	<TableCard>
		<CollapsibleCardHeader
			count={ checks.length }
			title={ sprintf(
				/* Translators: 1: Number of failed checks, 2: Failed checks fixed by activating agent access settings. */
				__( '%1$d failed checks to be fixed. Activating agent access settings fixes %2$d of them, the others require Angie or a manual fix.', 'elementor' ),
				checks.length,
				activationFixes,
			) }
			isExpanded={ isExpanded }
			isLoading={ isLoading }
			onToggle={ onToggle }
		/>
		{ isExpanded && <CheckTableHeader /> }
		{ children }
	</TableCard>
);

ChecksSummary.propTypes = {
	checks: PropTypes.arrayOf( PropTypes.object ).isRequired,
	activationFixes: PropTypes.number.isRequired,
	isExpanded: PropTypes.bool,
	isLoading: PropTypes.bool,
	onToggle: PropTypes.func.isRequired,
	children: PropTypes.node,
};
