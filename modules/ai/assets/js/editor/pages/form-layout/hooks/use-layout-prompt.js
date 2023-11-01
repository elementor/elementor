import { generateLayout } from '../../../api';
import usePrompt from '../../../hooks/use-prompt';

const useLayoutPrompt = ( type, initialValue ) => {
	return usePrompt( ( prompt, attachments, prevGeneratedIds, signal ) => generateLayout( prompt, attachments, type, prevGeneratedIds, signal ), initialValue );
};

export default useLayoutPrompt;
