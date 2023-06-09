import { Box } from '@elementor/ui';
import { IMAGE_ACTIONS } from '../consts/consts';
import useImageNavigation from '../../../hooks/use-image-navigation';
import ZoomImage from './components/zoom-image';
import ResultsGrid from './components/results-grid';

const FormGenerateResult = (
	{
		maybeUploadImage,
		images,
		aspectRatio,
		viewData,
	},
) => {
	const { zoomedImageIndex, setZoomedImageIndex, imageNavigation } = useImageNavigation( images );

	const handleImageAction = ( imageAction, imageForAction ) => {
		switch ( imageAction ) {
			case IMAGE_ACTIONS.USE:
				maybeUploadImage( imageForAction, true );
				break;
			case IMAGE_ACTIONS.REFERENCE: // TODO: currently the reference action is the edit action.
				maybeUploadImage( imageForAction );
				break;
			case IMAGE_ACTIONS.ZOOM:
				setZoomedImageIndex( imageForAction );
				break;
		}
	};

	return (
		<Box sx={ { overflowY: 'scroll', p: 8 } } flexGrow={ 1 }>
			{ zoomedImageIndex > -1
				? <ZoomImage { ...{
					images,
					zoomedImageIndex,
					handleImageAction,
					imageNavigation,
					viewData,
				} } />
				: <ResultsGrid { ...{
					images,
					handleImageAction,
					aspectRatio,
				} } />
			}
		</Box>
	);
};

FormGenerateResult.propTypes = {
	maybeUploadImage: PropTypes.func.isRequired,
	images: PropTypes.array,
	aspectRatio: PropTypes.string,
	viewData: PropTypes.object.isRequired,
};

export default FormGenerateResult;
