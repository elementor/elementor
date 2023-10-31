import { generateLayout } from '../../../api';
import usePrompt from '../../../hooks/use-prompt';

const useLayoutPrompt = ( type, initialValue ) => {
	return usePrompt( ( prompt, prevGeneratedIds, signal ) => generateLayout( prompt, type, prevGeneratedIds, signal ), initialValue );
};

export default useLayoutPrompt;
