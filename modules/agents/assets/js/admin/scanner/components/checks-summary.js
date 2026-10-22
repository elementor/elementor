import { ChevronDownIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { REDUCED_MOTION_SX, SCANNER_COLORS, SCANNER_LAYOUT, SCANNER_MOTION } from '../scanner-constants';
import { CheckTableHeader, TableCard } from './fix-table';

export const ChecksSummary = ( { checks, activationFixes, isExpanded, isLoading, onToggle, children } ) => {
	const otherFixes = Math.max( 0, checks.length - activationFixes );

	return (
		<TableCard>
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
						<Typography variant="caption" color="text.secondary">{ checks.length }</Typography>
					</Box>
					<Typography variant="subtitle2" color="text.primary">
						{ sprintf(
							/* Translators: 1: Checks turned on by activating Agent Ready, 2: Checks that still need a manual fix. */
							__( 'Checks to fix. Activate fixes %1$d of them. The other %2$d need you or Angie.', 'elementor' ),
							activationFixes,
							otherFixes,
						) }
					</Typography>
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
			{ isExpanded && <CheckTableHeader /> }
			{ children }
		</TableCard>
	);
};

ChecksSummary.propTypes = {
	checks: PropTypes.arrayOf( PropTypes.object ).isRequired,
	activationFixes: PropTypes.number.isRequired,
	isExpanded: PropTypes.bool,
	isLoading: PropTypes.bool,
	onToggle: PropTypes.func.isRequired,
	children: PropTypes.node,
};
