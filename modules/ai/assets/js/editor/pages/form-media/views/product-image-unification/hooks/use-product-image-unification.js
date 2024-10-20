import useImagePrompt from '../../../hooks/use-image-prompt';
import { getProductImageUnification } from '../../../../../api';
import { useCallback } from 'react';

const useProductImageUnification = ( initialValue ) => {
	const fetchAction = useCallback( ( payload ) => getProductImageUnification( payload ), [] );

	return useImagePrompt( fetchAction, initialValue );
};

export default useProductImageUnification;
