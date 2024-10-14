import useImagePrompt from '../../../hooks/use-image-prompt';
import { getProductImageUnification } from '../../../../../api';

const useProductImageUnification = ( initialValue ) => {
	const fetchAction = ( payload ) => getProductImageUnification( payload );

	return useImagePrompt( fetchAction, initialValue );
};

export default useProductImageUnification;
