import { generateLayout } from '../../../api';
import usePrompt from '../../../hooks/use-prompt';

const useLayoutPrompt = ( type, initialValue ) => {
	return usePrompt( ( requestBody, signal ) => {
		requestBody.variationType = type;

		return generateLayout( requestBody, signal );
	}, initialValue );
};

export default useLayoutPrompt;
