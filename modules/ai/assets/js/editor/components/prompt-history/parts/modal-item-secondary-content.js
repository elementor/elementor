import { Stack, styled, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';

const StyledDateSubtitle = styled( Typography )`
  color: ${ ( { theme } ) => theme.palette.secondary.light };
`;

const StyledImage = styled( 'img' )`
  height: 72px;
  width: 72px;
  object-fit: cover;
  margin-right: ${ ( { theme } ) => theme.spacing( 0.5 ) };
`;

const PromptHistoryItemSecondaryContent = ( { date, thumbnails } ) => {
	return (
		<Stack direction="column" width="90%">
			<StyledDateSubtitle variant="caption">{ date }</StyledDateSubtitle>

			{ thumbnails?.length > 0 && (
				<Stack flexDirection="row" mt={ 1 }>
					{ thumbnails.map(
						/**
						 * @param {Object} thumb
						 * @return {React.ReactNode}
						 */( thumb ) => (
							<StyledImage key={ `thumbnail-${ thumb.seed }` }
								alt=""
								src={ thumb.image_url } />
						) ) }
				</Stack>
			) }
		</Stack>
	);
};

PromptHistoryItemSecondaryContent.propTypes = {
	date: PropTypes.string.isRequired,
	thumbnails: PropTypes.array,
};

export default PromptHistoryItemSecondaryContent;
