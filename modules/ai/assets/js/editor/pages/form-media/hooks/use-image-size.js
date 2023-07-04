import { IMAGE_ASPECT_RATIO } from '../constants';

const useImageSize = ( aspectRatio ) => {
	const { width, height } = IMAGE_ASPECT_RATIO[ aspectRatio ];

	return { width, height };
};

export default useImageSize;
