import { List, ListSubheader, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import PromptHistoryItem from './modal-item';
import { translateDate } from '../../../helpers/date-helpers';

const StyledPeriodList = styled( List )( ( { theme } ) => ( {
	borderBottom: `1px solid ${ theme.palette.action.focus }`,
} ) );

const StyledPeriodTitle = styled( Typography )( ( { theme } ) => ( {
	padding: theme.spacing( 1.5, 2 ),
	color: theme.palette.secondary.light,
} ) );

const DATE_FORMAT = __( 'F j, g:i A', 'elementor' );

const PromptHistoryPeriod = ( { periodTitle, historyItems, onHistoryItemDelete } ) => {
	return (
		<StyledPeriodList
			data-testid="e-ph-p"
			subheader={
				<ListSubheader disableSticky={ true } disableGutters={ true }>
					<StyledPeriodTitle variant="body2" role="heading" aria-level="6">{ periodTitle }</StyledPeriodTitle>
				</ListSubheader>
			} >

			{ historyItems.map( ( { id, date, ...props } ) => {
				return (
					<PromptHistoryItem
						key={ id }
						date={ translateDate( DATE_FORMAT, date ) }
						onHistoryItemDelete={ () => onHistoryItemDelete( id ) }
						id={ id }
						{ ...props } />
				);
			} ) }
		</StyledPeriodList>
	);
};

PromptHistoryPeriod.propTypes = {
	periodTitle: PropTypes.string.isRequired,
	historyItems: PropTypes.array.isRequired,
	onHistoryItemDelete: PropTypes.func.isRequired,
};

export default PromptHistoryPeriod;
