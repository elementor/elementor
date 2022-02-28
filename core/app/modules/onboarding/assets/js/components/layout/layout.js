import { useRef, useContext, useEffect } from 'react';
import { OnboardingContext } from '../../context/context';

import Header from './header';
import ProgressBar from '../progress-bar/progress-bar';
import Content from '../../../../../../assets/js/layout/content';
import Connect from '../../utils/connect';

export default function Layout( props ) {
	useEffect( () => {
		// Send modal load event for current step.
		elementorCommon.events.dispatchEvent( {
			placement: elementorAppConfig.onboarding.eventPlacement,
			event: 'modal load',
			step: props.pageId,
			user_state: elementorCommon.config.library_connect.is_connected ? 'logged' : 'anon',
		} );

		updateState( {
			currentStep: props.pageId,
			nextStep: props.nextStep || '',
		} );
	}, [] );

	const { state, updateState } = useContext( OnboardingContext ),
		headerButtons = [],
		goProButtonRef = useRef(),
		createAccountButton = {
			id: 'create-account',
			text: __( 'Create Account', 'elementor-pro' ),
			hideText: false,
			elRef: useRef(),
			url: elementorAppConfig.onboarding.urls.connect + elementorAppConfig.onboarding.utms.connectTopBar,
			target: '_blank',
			rel: 'opener',
		};

	if ( state.isLibraryConnected ) {
		headerButtons.push( {
			id: 'my-elementor',
			text: __( 'My Elementor', 'elementor-pro' ),
			hideText: false,
			icon: 'eicon-user-circle-o',
			url: 'https://my.elementor.com/',
			target: '_blank',
		} );
	} else {
		headerButtons.push( createAccountButton );
	}

	if ( ! state.hasPro ) {
		headerButtons.push( {
			id: 'go-pro',
			text: __( 'Go Pro', 'elementor-pro' ),
			hideText: false,
			icon: 'eicon-pro-icon',
			url: 'https://elementor.com/pro/?utm_source=onboarding-wizard&utm_campaign=gopro&utm_medium=wp-dash&utm_content=top-bar&utm_term=' + elementorAppConfig.onboarding.onboardingVersion,
			target: '_blank',
			elRef: goProButtonRef,
			onClick: () => {
				elementorCommon.events.dispatchEvent( {
					placement: elementorAppConfig.onboarding.eventPlacement,
					event: 'go pro',
					step: state.currentStep,
					contributor: state.isUsageDataShared,
				} );
			},
		} );
	}

	return (
		<div className="eps-app__lightbox">
			<div className="eps-app e-onboarding">
				{ ! state.isLibraryConnected &&
					<Connect
						buttonRef={ createAccountButton.elRef }
					/>
				}
				<Header
					title={ __( 'Getting Started', 'elementor' ) }
					buttons={ headerButtons }
				/>
				<div className={ 'eps-app__main e-onboarding__page-' + props.pageId }>
					<Content className="e-onboarding__content">
						<ProgressBar/>
						{ props.children }
					</Content>
				</div>
			</div>
		</div>
	);
}

Layout.propTypes = {
	pageId: PropTypes.string.isRequired,
	nextStep: PropTypes.string,
	className: PropTypes.string,
	children: PropTypes.any.isRequired,
};
