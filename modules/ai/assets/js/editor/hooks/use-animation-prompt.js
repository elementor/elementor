import { getAnimation } from '../api';
import usePrompt from './use-prompt';

const getAnimationResult = async ( payload, motionEffectType ) => {
	return getAnimation( { ...payload, motionEffectType } );
};

const useAnimationPrompt = ( motionEffectType, initialValue ) => {
	return usePrompt(
		( payload ) => getAnimationResult( payload, motionEffectType ),
		initialValue,
	);
};

export default useAnimationPrompt;
