import PropTypes from 'prop-types';
import PageContentLayout from './layout/page-content-layout';

export default function ThemeSelectionContentB( { actionButton, skipButton, noticeState } ) {
	return (
		<PageContentLayout
			title={ __( 'Which theme would you like?', 'elementor' ) }
			actionButton={ actionButton }
			skipButton={ skipButton }
			noticeState={ noticeState }
		>
			<div className="e-onboarding__page-content-variant-b">
				<p className="e-onboarding__theme-selection-description">
					{ __( 'The theme delivers fast setup, intuitive tools, and business-focused widgets.', 'elementor' ) }
				</p>
				<p className="e-onboarding__theme-selection-subtitle">
					{ __( 'You can switch your theme later on', 'elementor' ) }
				</p>

				<div className="e-onboarding__theme-cards">
					<div className="e-onboarding__theme-card">
						<div className="e-onboarding__theme-card-illustration">
							<svg width="220" height="153" viewBox="0 0 220 153" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M8.44682 222.715L13.0914 8.07447L211.074 8.10033L206.454 222.751L8.44682 222.715Z" fill="white" />
								<path d="M8.44682 222.715L13.0914 8.07447L211.074 8.10033L206.454 222.751L8.44682 222.715Z" fill="white" />
							</svg>
						</div>
						<div className="e-onboarding__theme-card-content">
							<h3 className="e-onboarding__theme-card-title">
								{ __( 'Hello', 'elementor' ) }
							</h3>
							<p className="e-onboarding__theme-card-description">
								{ __( 'It\'s fast, flexible, and beginner-friendly, offering a solid foundation for customizable designs.', 'elementor' ) }
							</p>
						</div>
					</div>

					<div className="e-onboarding__theme-card e-onboarding__theme-card--selected">
						<div className="e-onboarding__theme-card-illustration">
							<svg width="220" height="164" viewBox="0 0 220 164" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M8.44682 222.74L13.0914 8.09986L211.074 8.12572L206.454 222.777L8.44682 222.74Z" fill="white" />
								<path d="M8.44682 222.74L13.0914 8.09986L211.074 8.12572L206.454 222.777L8.44682 222.74Z" fill="white" />
							</svg>
						</div>
						<div className="e-onboarding__theme-card-content">
							<h3 className="e-onboarding__theme-card-title">
								{ __( 'Hello Biz', 'elementor' ) }
							</h3>
							<p className="e-onboarding__theme-card-description">
								{ __( 'It offers premium Elementor tools, and a responsive foundation for startups and portfolios.', 'elementor' ) }
							</p>
						</div>
					</div>
				</div>
			</div>
		</PageContentLayout>
	);
}

ThemeSelectionContentB.propTypes = {
	actionButton: PropTypes.object.isRequired,
	skipButton: PropTypes.object.isRequired,
	noticeState: PropTypes.object,
};
