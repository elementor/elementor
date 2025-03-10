import useImagePrompt from '../../../hooks/use-image-prompt';
import { getProductImageUnification } from '../../../../../api';
import { useRef } from 'react';

const useProductImageUnification = ( initialValue ) => {
	const fetchAction = useRef( ( payload ) => getProductImageUnification( payload, true ) );

	return useImagePrompt( fetchAction.current, initialValue );
};

export default useProductImageUnification;
