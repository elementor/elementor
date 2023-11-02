import { generateLayout } from '../../../api';
import usePrompt from '../../../hooks/use-prompt';

const useLayoutPrompt = ( type, initialValue ) => {
	return usePrompt( ( prompt, attachments, prevGeneratedIds, promptAffects, signal ) => generateLayout( prompt, attachments, type, prevGeneratedIds, promptAffects, signal ), initialValue );
};

export default useLayoutPrompt;
