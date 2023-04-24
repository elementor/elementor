import { getCompletionText, getEditText } from '../api';
import usePrompt from './use-prompt';

const getTextResult = async ( prompt, instruction ) => {
	if ( instruction ) {
		return getEditText( prompt, instruction );
	}

	return getCompletionText( prompt );
};

const useTextPrompt = ( initialValue ) => {
	const promptData = usePrompt( getTextResult, initialValue );

	return promptData;
};

export default useTextPrompt;
