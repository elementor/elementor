import { getCompletionText, getEditText } from '../api';
import usePrompt from './use-prompt';

const getTextResult = async ( payload ) => {
	if ( payload?.instruction ) {
		return getEditText( payload );
	}

	return getCompletionText( payload );
};

const useTextPrompt = ( initialValue ) => {
	const promptData = usePrompt( getTextResult, initialValue );

	return promptData;
};

export default useTextPrompt;
