import Grid from 'elementor-app/ui/grid/grid';
import Layout from '../components/layout/layout';
import Card from '../components/card';
import FooterButtons from '../components/layout/footer-buttons';

export default function GoodToGo() {
	const pageId = 'goodToGo',
		skipButton = {
			text: __( 'Skip', 'elementor' ),
			href: elementorAppConfig.onboarding.urls.createNewPage,
		},
		kitLibraryLink = elementorAppConfig.onboarding.urls.kitLibrary + '&referrer=onboarding';

	return (
		<Layout pageId={ pageId }>
			<h1 className="e-onboarding__page-content-section-title">
				{ __( 'That\'s a wrap! What\'s next?', 'elementor' ) }
			</h1>
			<div className="e-onboarding__page-content-section-text">
				{ __( 'There are two ways to get started with Elementor:', 'elementor' ) }
			</div>
			<Grid container alignItems="center" justify="space-between" className="e-onboarding__cards-grid e-onboarding__page-content">
				<Card
					name="blank"
					image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Blank_Canvas.svg' }
					imageAlt={ __( 'Click here to create a new page and open it in Elementor Editor', 'elementor' ) }
					text={ __( 'Edit a blank canvas with the Elementor Editor', 'elementor' ) }
					link={ elementorAppConfig.onboarding.urls.createNewPage }
				/>
				<Card
					name="template"
					image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Library.svg' }
					imageAlt={ __( 'Click here to go to Elementor\'s Kit Library', 'elementor' ) }
					text={ __( 'Browse from +100 templates or import your own', 'elementor' ) }
					link={ kitLibraryLink }
					clickAction={ () => {
						// The location is reloaded to make sure the Kit Library's state is re-created.
						location.href = kitLibraryLink;
						location.reload();
					} }
				/>
			</Grid>
			<FooterButtons skipButton={ skipButton } className="e-onboarding__good-to-go-footer" />
		</Layout>
	);
}
