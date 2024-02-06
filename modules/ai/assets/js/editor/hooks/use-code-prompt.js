import { getCustomCode, getCustomCSS } from '../api';
import usePrompt from './use-prompt';

const getCodeResult = async ( payload, { codeLanguage, htmlMarkup, elementId } ) => {
	if ( 'css' === codeLanguage ) {
		return getCustomCSS( { ...payload, htmlMarkup, elementId } );
	}

	return getCustomCode( { ...payload, codeLanguage } );
};

const useCodePrompt = ( { codeLanguage, htmlMarkup, elementId, initialCredits: credits } ) => {
	const promptData = usePrompt(
		( payload ) => getCodeResult( payload, { codeLanguage, htmlMarkup, elementId } ),
		{ credits },
	);

	return promptData;
};

export default useCodePrompt;
