import { useRef } from 'react';
import Connect from '../utils/connect';
import PageContentLayout from './layout/page-content-layout';

export default function AccountContentA( { 
	actionButton, 
	skipButton, 
	noticeState, 
	pageTexts, 
	state, 
	connectSuccessCallback, 
	connectFailureCallback, 
	connectReadyCallback,
	alreadyHaveAccountLinkRef,
	OnboardingEventTracking 
} ) {
	return (
		<PageContentLayout
			image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Illustration_Account.svg' }
			title={ elementorAppConfig.onboarding.experiment ? __( 'You\'re here!', 'elementor' ) : __( 'You\'re here! Let\'s set things up.', 'elementor' ) }
			secondLineTitle={ elementorAppConfig.onboarding.experiment ? __( ' Let\'s get connected.', 'elementor' ) : '' }
			actionButton={ actionButton }
			skipButton={ skipButton }
			noticeState={ noticeState }
		>
			{ actionButton.ref && ! state.isLibraryConnected &&
			<Connect
				buttonRef={ actionButton.ref }
				successCallback={ ( event, data ) => connectSuccessCallback( event, data ) }
				errorCallback={ connectFailureCallback }
				readyCallback={ connectReadyCallback }
			/> }
			<span>
				{ pageTexts.firstLine }
			</span>
			<ul>
				{ pageTexts.listItems.map( ( listItem, index ) => {
					return <li key={ 'listItem' + index }>{ listItem }</li>;
				} ) }
			</ul>
		</PageContentLayout>
	);
}
