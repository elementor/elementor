import { Box, styled, Typography } from '@elementor/ui';
import PromptHistoryItem from './modal-item';
import { useContext } from 'react';
import { PromptHistoryContext } from '../index';
import { translateDate } from '../../../date-helpers';

const StyledPeriod = styled( Box )( ( { theme } ) => ( {
	borderBottom: `1px solid ${ theme.palette.action.focus }`,
} ) );

const StyledPeriodTitle = styled( Typography )( ( { theme } ) => ( {
	padding: theme.spacing( 1.5, 2 ),
	fontSize: '14px',
	color: theme.palette.secondary.light,
} ) );

const DATE_FORMAT = __( 'F j, g:i A', 'elementor' );

const PromptHistoryPeriod = ( { periodTitle, historyItems, onHistoryItemDelete } ) => {
	const { onPromptReuse, onResultEdit, onImagesRestore } = useContext( PromptHistoryContext );

	return (
		<StyledPeriod data-testid="e-ph-p">
			<StyledPeriodTitle variant="subtitle1">{ periodTitle }</StyledPeriodTitle>

			{ historyItems.map( ( { id, date, action, prompt, text, images, imageType, ratio } ) => {
				return (
					<PromptHistoryItem key={ id }
						date={ translateDate( DATE_FORMAT, date ) }
						images={ images }
						action={ action }
						prompt={ prompt }
						id={ id }
						onHistoryItemDelete={ () => onHistoryItemDelete( id ) }
						onPromptReuse={ onPromptReuse ? () => onPromptReuse( id, prompt ) : null }
						onResultEdit={ onResultEdit ? () => onResultEdit( id, text ) : null }
						onImagesRestore={ onImagesRestore ? () => onImagesRestore( id, { prompt, images, imageType, ratio } ) : null } /> );
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
