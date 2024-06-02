import { getExcerpt } from '../api';
import usePrompt from './use-prompt';

const useExcerptPrompt = ( initialValue ) => {
	return usePrompt( async ( payload ) => getExcerpt( payload ), initialValue );
};

export default useExcerptPrompt;
