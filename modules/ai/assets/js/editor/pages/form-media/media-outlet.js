import { useEffect } from 'react';
import View from './components/view';
import Loader from '../../components/loader';
import { LOCATIONS } from './constants';
import Generate from './views/generate';
import ImageTools from './views/image-tools';
import Resize from './views/resize';
import InPainting from './views/in-painting';
import OutPainting from './views/out-painting';
import Variations from './views/variations';
import ReplaceBackground from './views/replace-background';
import RemoveBackground from './views/remove-background';
import { useLocation } from './context/location-context';
import { useEditImage } from './context/edit-image-context';
import {
	ACTION_TYPES,
	useSubscribeOnPromptHistoryAction,
} from '../../components/prompt-history/context/prompt-history-action-context';

const MediaOutlet = () => {
	const { editImage } = useEditImage();

	const { current, navigate } = useLocation( { current: LOCATIONS.GENERATE } );

	useEffect( () => {
		const isNotPlaceholderImage = editImage.id;

		if ( isNotPlaceholderImage ) {
			navigate( LOCATIONS.IMAGE_TOOLS );
		}
	}, [ editImage.id ] );

	useSubscribeOnPromptHistoryAction( [
		{
			type: ACTION_TYPES.RESTORE,
			handler() {
				if ( current !== LOCATIONS.GENERATE ) {
					navigate( LOCATIONS.GENERATE );
				}
			},
		},
	] );

	if ( ! current ) {
		return (
			<View alignItems="center">
				<Loader />
			</View>
		);
	}

	return (
		<>
			{ current === LOCATIONS.GENERATE && <Generate /> }
			{ current === LOCATIONS.IMAGE_TOOLS && <ImageTools /> }
			{ current === LOCATIONS.VARIATIONS && <Variations /> }
			{ current === LOCATIONS.IN_PAINTING && <InPainting /> }
			{ current === LOCATIONS.OUT_PAINTING && <OutPainting /> }
			{ current === LOCATIONS.RESIZE && <Resize /> }
			{ current === LOCATIONS.REPLACE_BACKGROUND && <ReplaceBackground /> }
			{ current === LOCATIONS.REMOVE_BACKGROUND && <RemoveBackground /> }
		</>
	);
};

export default MediaOutlet;
