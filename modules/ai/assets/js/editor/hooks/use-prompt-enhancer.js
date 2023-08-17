import { getImagePromptEnhanced, getLayoutPromptEnhanced } from '../api';
import usePrompt from './use-prompt';

const enhancePromptMap = new Map( [
	[ 'media', getImagePromptEnhanced ],
	[ 'layout', getLayoutPromptEnhanced ],
] );

const getResult = ( prompt, type ) => {
	if ( ! enhancePromptMap.has( type ) ) {
		throw new Error( `Invalid prompt type: ${ type }` );
	}

	return enhancePromptMap.get( type )( prompt );
};

/**
 * Hook to enhance a prompt.
 *
 * @param {string}             prompt
 * @param {'media' | 'layout'} type
 * @return {{enhancedPrompt: string | undefined, isEnhancing: boolean, enhance: (function(...[*]): Promise)}}
 */
const usePromptEnhancer = ( prompt, type ) => {
	const {
		data: enhancedData,
		isLoading: isEnhancing,
		send: enhance,
	} = usePrompt( () => getResult( prompt, type ), prompt );

	return {
		enhance,
		isEnhancing,
		enhancedPrompt: enhancedData?.result,
	};
};

export default usePromptEnhancer;
