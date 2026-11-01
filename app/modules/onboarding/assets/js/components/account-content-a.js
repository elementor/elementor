import PropTypes from 'prop-types';
import Connect from '../utils/connect';
import PageContentLayout from './layout/page-content-layout';
import {
	getLegacyAccountScreenConfig,
	resolveAccountScreenImage,
	resolveDisconnectedAccountHeadlines,
} from '../utils/account-screen-config';

export default function AccountContentA( {
	actionButton,
	skipButton,
	noticeState,
	pageTexts,
	state,
	connectSuccessCallback,
	connectFailureCallback,
} ) {
	const accountScreen = ! state.isLibraryConnected ? getLegacyAccountScreenConfig() : null;
	const { title, secondLineTitle } = resolveDisconnectedAccountHeadlines( accountScreen );
	const image = resolveAccountScreenImage( accountScreen );

	return (
		<PageContentLayout
			image={ image }
			title={ title }
			secondLineTitle={ secondLineTitle }
			actionButton={ actionButton }
			skipButton={ skipButton }
			noticeState={ noticeState }
		>
			{ actionButton.ref && ! state.isLibraryConnected &&
			<Connect
				buttonRef={ actionButton.ref }
				successCallback={ ( event, data ) => connectSuccessCallback( event, data ) }
				errorCallback={ connectFailureCallback }
			/> }
			{ pageTexts.firstLine &&
			<span>
				{ pageTexts.firstLine }
			</span> }
			{ pageTexts.listItems?.length > 0 &&
			<ul>
				{ pageTexts.listItems.map( ( listItem, index ) => {
					return <li key={ 'listItem' + index }>{ listItem }</li>;
				} ) }
			</ul> }
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
};
