import { getCustomCode, getCustomCSS } from '../api';
import usePrompt from './use-prompt';

const getCodeResult = async ( prompt, { codeLanguage, htmlMarkup, elementId } ) => {
	if ( 'css' === codeLanguage ) {
		return getCustomCSS( prompt, htmlMarkup, elementId );
	}

	return getCustomCode( prompt, codeLanguage );
};

const useCodePrompt = ( { codeLanguage, htmlMarkup, elementId, initialCredits: credits } ) => {
	const promptData = usePrompt(
		( promptValue ) => getCodeResult( promptValue, { codeLanguage, htmlMarkup, elementId } ),
		{ credits },
	);

	return promptData;
};

export default useCodePrompt;
