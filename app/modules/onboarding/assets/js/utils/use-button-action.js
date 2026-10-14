import { useContext } from 'react';
import { OnboardingContext } from '../context/context';
import { useNavigate } from '@reach/router';

export default function useButtonAction( pageId, nextPage ) {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext );
	const navigate = useNavigate();

	const handleAction = ( action ) => {
		const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, action );
		updateState( stateToUpdate );
		navigate( 'onboarding/' + nextPage );
	};

	return {
		state,
		handleAction,
	};
}
