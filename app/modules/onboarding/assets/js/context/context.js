import { createContext, useCallback, useState } from 'react';

export const OnboardingContext = createContext( {} );

export function ContextProvider( props ) {
	const onboardingConfig = elementorAppConfig.onboarding,
		initialState = {
			// eslint-disable-next-line camelcase
			hasPro: elementorAppConfig.hasPro,
			isLibraryConnected: onboardingConfig.isLibraryConnected,
			isHelloThemeInstalled: onboardingConfig.helloInstalled,
			isHelloThemeActivated: onboardingConfig.helloActivated,
			siteName: onboardingConfig.siteName,
			siteLogo: onboardingConfig.siteLogo,
			proNotice: '',
			currentStep: '',
			nextStep: '',
			steps: {
				account: false,
				hello: false,
				siteName: false,
				siteLogo: false,
				goodToGo: false,
			},
		},
		[ state, setState ] = useState( initialState ),
		updateState = useCallback( ( newState ) => {
			setState( ( prev ) => ( { ...prev, ...newState } ) );
		}, [ setState ] ),
		getStateObjectToUpdate = ( stateObject, mainChangedPropertyKey, subChangedPropertyKey, subChangedPropertyValue ) => {
			const mutatedStateCopy = JSON.parse( JSON.stringify( stateObject ) );

			mutatedStateCopy[ mainChangedPropertyKey ][ subChangedPropertyKey ] = subChangedPropertyValue;

			return mutatedStateCopy;
		};

	return (
		<OnboardingContext.Provider value={ { state, setState, updateState, getStateObjectToUpdate } }>
			{ props.children }
		</OnboardingContext.Provider>
	);
}

ContextProvider.propTypes = {
	children: PropTypes.any,
};
