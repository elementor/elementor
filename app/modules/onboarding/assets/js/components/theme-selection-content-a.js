import PropTypes from 'prop-types';
import PageContentLayout from './layout/page-content-layout';

export default function ThemeSelectionContentA( { actionButton, skipButton, noticeState } ) {
	return (
		<PageContentLayout
			image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Illustration_Hello_Biz.svg' }
			title={ __( 'Every site starts with a theme.', 'elementor' ) }
			actionButton={ actionButton }
			skipButton={ skipButton }
			noticeState={ noticeState }
		>
			<p>
				{ __( 'Hello Biz by Elementor helps you launch your professional business website - fast.', 'elementor' ) }
			</p>
			{ ! elementorAppConfig.onboarding.experiment && <p>
				{ __( 'Here\'s why:', 'elementor' ) }
			</p> }
			<ul className="e-onboarding__feature-list">
				<li>{ __( 'Get online faster', 'elementor' ) }</li>
				<li>{ __( 'Lightweight and fast loading', 'elementor' ) }</li>
				<li>{ __( 'Great for SEO', 'elementor' ) }</li>
			</ul>
		</PageContentLayout>
	);
}

ThemeSelectionContentA.propTypes = {
	actionButton: PropTypes.object.isRequired,
	skipButton: PropTypes.object.isRequired,
	noticeState: PropTypes.object,
};
