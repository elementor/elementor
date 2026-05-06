import PropTypes from 'prop-types';
import AiLoaderIcon from '../../icons/ai-loader-icon';
import {
	PlannerLoaderBadge,
	PlannerPreviewContainer,
	PlannerPreviewFrame,
	PlannerPreviewImage,
	PlannerPreviewInner,
} from './styled-components';

const PlannerPreview = ( { image } ) => {
	return (
		<PlannerPreviewContainer>
			<PlannerPreviewInner>
				<PlannerPreviewFrame>
					{ image && (
						<PlannerPreviewImage
							component="img"
							src={ image }
							alt=""
						/>
					) }
				</PlannerPreviewFrame>
				<PlannerLoaderBadge>
					<AiLoaderIcon />
				</PlannerLoaderBadge>
			</PlannerPreviewInner>
		</PlannerPreviewContainer>
	);
};

PlannerPreview.propTypes = {
	image: PropTypes.string,
};

export default PlannerPreview;
