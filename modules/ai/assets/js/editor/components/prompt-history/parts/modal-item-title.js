import { styled, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';
import Tooltip from '../../tooltip';

const StyledTitle = styled( Typography )`
  margin-bottom: ${ ( { theme } ) => theme.spacing( 0.5 ) };
`;

const PromptHistoryItemTitle = ( { prompt } ) => {
	return (
		<Tooltip title={ prompt } arrow={ false } placement="bottom-start">
			<StyledTitle variant="body2" noWrap paragraph>{ prompt }</StyledTitle>
		</Tooltip>
	);
};

PromptHistoryItemTitle.propTypes = {
	prompt: PropTypes.string.isRequired,
};

export default PromptHistoryItemTitle;
