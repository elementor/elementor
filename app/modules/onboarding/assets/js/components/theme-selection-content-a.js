import PropTypes from 'prop-types';
import PageContentLayout from './layout/page-content-layout';

export default function ThemeSelectionContentA( { actionButton, skipButton, noticeState } ) {
	return (
		<PageContentLayout
			image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Illustration_Hello.svg' }
			title={ __( 'Every site starts with a theme.', 'elementor' ) }
			actionButton={ actionButton }
			skipButton={ skipButton }
			noticeState={ noticeState }
		>
			<p>
				{ __( 'Hello is Elementor\'s official blank canvas theme optimized to build your website exactly the way you want.', 'elementor' ) }
			</p>
			{ ! elementorAppConfig.onboarding.experiment && <p>
				{ __( 'Here\'s why:', 'elementor' ) }
			</p> }
			<ul className="e-onboarding__feature-list">
				<li>{ __( 'Light-weight and fast loading', 'elementor' ) }</li>
				<li>{ __( 'Great for SEO', 'elementor' ) }</li>
				<li>{ __( 'Already being used by 1M+ web creators', 'elementor' ) }</li>
			</ul>
		</PageContentLayout>
	);
}

ThemeSelectionContentA.propTypes = {
	actionButton: PropTypes.object.isRequired,
	skipButton: PropTypes.object.isRequired,
	noticeState: PropTypes.object,
};
