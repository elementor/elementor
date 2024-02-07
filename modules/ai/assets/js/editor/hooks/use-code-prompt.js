import { getCustomCode, getCustomCSS } from '../api';
import usePrompt from './use-prompt';

const getCodeResult = async ( payload, { codeLanguage, htmlMarkup, elementId } ) => {
	if ( 'css' === codeLanguage ) {
		return getCustomCSS( { ...payload, html_markup: htmlMarkup, element_id: elementId } );
	}

	return getCustomCode( { ...payload, language: codeLanguage } );
};

const useCodePrompt = ( { codeLanguage, htmlMarkup, elementId, initialCredits: credits } ) => {
	const promptData = usePrompt(
		( payload ) => getCodeResult( payload, { codeLanguage, htmlMarkup, elementId } ),
		{ credits },
	);

	return promptData;
};

export default useCodePrompt;
