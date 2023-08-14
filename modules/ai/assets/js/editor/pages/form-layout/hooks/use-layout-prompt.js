import { generateLayout } from '../../../api';
import usePrompt from '../../../hooks/use-prompt';

const SCREENSHOT_TYPE_MAP = Object.freeze( {
	styling: 'Styling_Variation',
	wireframe: 'Wireframe_Variation',
	mixed: 'MixedStylingAndWireFrame_Variation',
} );

const useLayoutPrompt = ( type, initialValue ) => {
	return usePrompt( ( prompt, signal ) => generateLayout( prompt, SCREENSHOT_TYPE_MAP[ type ], signal ), initialValue );
};

export default useLayoutPrompt;
