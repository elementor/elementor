import { generateLayout } from '../../../api';
import usePrompt from '../../../hooks/use-prompt';

const useLayoutPrompt = ( type, initialValue ) => {
	return usePrompt( ( prompt, signal ) => generateLayout( prompt, type, signal ), initialValue );
};

export default useLayoutPrompt;
