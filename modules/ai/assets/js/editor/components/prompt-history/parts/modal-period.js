import { Box, styled, Typography } from '@elementor/ui';
import PromptHistoryItem from './modal-item';
import { useContext } from 'react';
import { PromptHistoryContext } from '../index';
import { translateDate } from '../../../dateHelpers';

const StyledPeriod = styled( Box )( ( { theme } ) => ( {
	borderBottom: `1px solid ${ theme.palette.action.focus }`,
} ) );

const StyledPeriodTitle = styled( Typography )( ( { theme } ) => ( {
	padding: theme.spacing( 4, 5 ),
	color: theme.palette.secondary.light,
} ) );

const DATE_FORMAT = __( 'F j, g:i A', 'elementor' );

const PromptHistoryPeriod = ( { periodTitle, historyItems, onHistoryItemDelete } ) => {
	const { onPromptReuse, onResultEdit } = useContext( PromptHistoryContext );

	return (
		<StyledPeriod data-testid="e-ph-p">
			<StyledPeriodTitle variant="subtitle1">{ periodTitle }</StyledPeriodTitle>

			{ historyItems.map( ( { id, date, action, prompt, result } ) => {
				return (
					<PromptHistoryItem key={ id }
						date={ translateDate( DATE_FORMAT, date ) }
						action={ action }
						prompt={ prompt }
						id={ id }
						onHistoryItemDelete={ () => onHistoryItemDelete( id ) }
						onPromptReuse={ () => onPromptReuse( id, prompt ) }
						onResultEdit={ onResultEdit ? () => onResultEdit( id, result ) : null } /> );
			} ) }
		</StyledPeriod>
	);
};

PromptHistoryPeriod.propTypes = {
	periodTitle: PropTypes.string.isRequired,
	historyItems: PropTypes.array.isRequired,
	onHistoryItemDelete: PropTypes.func.isRequired,
};

export default PromptHistoryPeriod;
