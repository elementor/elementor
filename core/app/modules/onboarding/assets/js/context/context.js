import { createContext, useCallback, useState } from 'react';

export const Context = createContext( {} );

export function ContextProvider( props ) {
	const onboardingConfig = elementorAppConfig.onboarding,
		initialState = {
			// eslint-disable-next-line camelcase
			hasPro: elementorAppConfig.hasPro,
			isLibraryConnected: onboardingConfig.isLibraryConnected,
			isHelloThemeInstalled: onboardingConfig.helloInstalled,
			isHelloThemeActivated: onboardingConfig.helloActivated,
			isUsageDataShared: elementorCommon.config[ 'event-tracker' ].isUserDataShared,
			helloOptInChecked: onboardingConfig.helloOptOut,
			trackerCheckboxChecked: onboardingConfig.isUserDataShared,
			siteName: onboardingConfig.siteName,
			siteLogo: onboardingConfig.siteLogo,
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
		getStateObjectToUpdate = useCallback( ( stateObject, mainChangedPropertyKey, subChangedPropertyKey, subChangedPropertyValue ) => {
			const mutatedStateCopy = JSON.parse( JSON.stringify( stateObject ) );

			mutatedStateCopy[ mainChangedPropertyKey ][ subChangedPropertyKey ] = subChangedPropertyValue;

			return mutatedStateCopy;
		}, [] );

	return (
		<Context.Provider value={ { state, setState, updateState, getStateObjectToUpdate } }>
			{ props.children }
		</Context.Provider>
	);
}

ContextProvider.propTypes = {
	children: PropTypes.any,
};
