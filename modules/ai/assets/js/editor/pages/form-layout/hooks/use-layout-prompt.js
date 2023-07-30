import { generateLayout } from '../../../api';
import usePrompt from '../../../hooks/use-prompt';

const getLayoutResult = async ( prompt ) => generateLayout( prompt );

const useLayoutPrompt = ( initialValue ) => {
	return usePrompt( getLayoutResult, initialValue );
};

export default useLayoutPrompt;
