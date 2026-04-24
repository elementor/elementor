import PropTypes from 'prop-types';
import AiLoaderIcon from '../../icons/ai-loader-icon';
import {
	PlannerLoaderBadge,
	PlannerPreviewContainer,
	PlannerPreviewFrame,
	PlannerPreviewImage1,
	PlannerPreviewImage2,
	PlannerPreviewInner,
} from './styled-components';

const PlannerPreview = ( { previewImage1, previewImage2 } ) => {
	return (
		<PlannerPreviewContainer>
			<PlannerPreviewInner>
				<PlannerPreviewFrame>
					{ previewImage1 && (
						<PlannerPreviewImage1
							component="img"
							src={ previewImage1 }
							alt=""
						/>
					) }
					{ previewImage2 && (
						<PlannerPreviewImage2
							component="img"
							src={ previewImage2 }
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
	previewImage1: PropTypes.string,
	previewImage2: PropTypes.string,
};

export default PlannerPreview;
