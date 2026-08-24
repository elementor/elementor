import PropTypes from 'prop-types';
import { useCallback } from 'react';
import PageContentLayout from './layout/page-content-layout';
import ThemeSelectionCard from './theme-selection-card';

const getThemeData = () => [
	{
		slug: 'hello-theme',
		label: __( 'Hello Theme', 'elementor' ),
		title: __( 'Build without limits', 'elementor' ),
		description: __( 'A minimal theme combining speed, flexibility, and control', 'elementor' ),
		illustration: {
			src: elementorCommon.config.urls.assets + 'images/app/onboarding/hello-card.svg',
		},
	},
	{
		slug: 'hello-biz',
		label: __( 'Hello Biz', 'elementor' ),
		title: __( 'Instant online presence', 'elementor' ),
		description: __( 'A business-first theme offering smart layouts, templates, and site parts', 'elementor' ),
		illustration: {
			src: elementorCommon.config.urls.assets + 'images/app/onboarding/hello-biz-card.svg',
			className: 'e-onboarding__theme-card-illustration--hello-biz',
		},
	},
];

export default function ThemeSelectionContentB( { actionButton, skipButton, noticeState, selectedTheme, onThemeSelect, isInstalling } ) {
	const handleThemeSelect = useCallback( ( themeSlug ) => {
		if ( onThemeSelect ) {
			onThemeSelect( themeSlug );
		}
	}, [ onThemeSelect ] );

	const themeData = getThemeData();

	return (
		<PageContentLayout
			title={ __( 'Choose the right theme for your website', 'elementor' ) }
			actionButton={ actionButton }
			skipButton={ skipButton }
			noticeState={ noticeState }
		>
			<div className="e-onboarding__page-content-theme-variant-b">
				<p className="e-onboarding__theme-selection-description">
					{ __( 'Hello themes provide a lightweight, Elementor-ready foundation for your site.', 'elementor' ) }
				</p>
				<p className="e-onboarding__theme-selection-subtitle">
					{ __( 'You can switch your theme anytime.', 'elementor' ) }
				</p>

				<div className="e-onboarding__theme-cards">
					{ themeData.map( ( theme ) => (
						<ThemeSelectionCard
							key={ theme.slug }
							themeSlug={ theme.slug }
							label={ theme.label }
							title={ theme.title }
							description={ theme.description }
							illustration={ theme.illustration }
							isSelected={ selectedTheme === theme.slug }
							isLoading={ isInstalling && selectedTheme === theme.slug }
							onSelect={ handleThemeSelect }
							aria-label={ `Select ${ theme.title } theme: ${ theme.description }` }
							role="button"
							tabIndex={ 0 }
						/>
					) ) }
				</div>
			</div>
		</PageContentLayout>
	);
}

ThemeSelectionContentB.propTypes = {
	actionButton: PropTypes.object.isRequired,
	skipButton: PropTypes.object.isRequired,
	noticeState: PropTypes.object,
	selectedTheme: PropTypes.string,
	onThemeSelect: PropTypes.func,
	isInstalling: PropTypes.bool,
};
