/* eslint-disable @wordpress/i18n-ellipsis */
import useThemeSelection from '../hooks/use-theme-selection';
import Layout from '../components/layout/layout';
import ThemeSelectionContentB from '../components/theme-selection-content-b';

export default function ThemeSelectionVariantB() {
	const {
		isInstalling,
		noticeState,
		actionButtonText,
		handleActionButtonClick,
	} = useThemeSelection();

	const pageId = 'hello';
	const nextStep = elementorAppConfig.onboarding.experiment ? 'chooseFeatures' : 'siteName';

	const actionButton = {
		text: actionButtonText,
		role: 'button',
		onClick: handleActionButtonClick,
	};

	if ( isInstalling ) {
		actionButton.className = 'e-onboarding__button--processing';
	}

	const skipButton = {
		text: __( 'Skip', 'elementor' ),
	};

	if ( isInstalling ) {
		skipButton.className = 'e-onboarding__button-skip--disabled';
	}

	return (
		<Layout pageId={ pageId } nextStep={ nextStep }>
			<ThemeSelectionContentB
				actionButton={ actionButton }
				skipButton={ skipButton }
				noticeState={ noticeState }
			/>
			<div className="e-onboarding__footnote">
				{ '* ' + __( 'You can switch your theme later on', 'elementor' ) }
			</div>
		</Layout>
	);
}
