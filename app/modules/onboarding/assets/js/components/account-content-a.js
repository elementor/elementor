import PropTypes from 'prop-types';
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
	actionButtonClickTracking,
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
				successCallback={ connectSuccessCallback }
				errorCallback={ connectFailureCallback }
				onClickTracking={ actionButtonClickTracking }
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

AccountContentA.propTypes = {
	actionButton: PropTypes.shape( {
		ref: PropTypes.object,
	} ).isRequired,
	skipButton: PropTypes.object,
	noticeState: PropTypes.object,
	pageTexts: PropTypes.shape( {
		firstLine: PropTypes.node,
		listItems: PropTypes.arrayOf( PropTypes.string ),
	} ).isRequired,
	state: PropTypes.shape( {
		isLibraryConnected: PropTypes.bool,
	} ).isRequired,
	connectSuccessCallback: PropTypes.func.isRequired,
	connectFailureCallback: PropTypes.func.isRequired,
	actionButtonClickTracking: PropTypes.func,
};
