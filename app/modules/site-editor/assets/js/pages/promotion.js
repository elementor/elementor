import AllPartsButton from '../organisms/all-parts-button';
import Button from 'elementor-app/ui/molecules/button';
import CardOverlay from 'elementor-app/ui/card/card-overlay';
import Grid from 'elementor-app/ui/grid/grid';
import Heading from 'elementor-app/ui/atoms/heading';
import Layout from '../templates/layout';
import SiteParts from '../organisms/site-parts';
import Text from 'elementor-app/ui/atoms/text';

import './promotion.scss';

export default function Promotion() {
	const promotionUrl = elementorAppConfig.promotion.upgrade_url || 'https://go.elementor.com/go-pro-theme-builder/',
		trackUpgradeClick = ( locationL1 = 'main_upgrade_button' ) => {
			try {
				elementorCommon?.eventsManager?.dispatchEvent?.( 'theme_builder_promotion', {
					app_type: 'editor',
					window_name: 'theme_builder_promotional_popup',
					interaction_type: 'click',
					target_type: 'buttun',
					target_name: 'theme_builder_upgrade_cta',
					interaction_result: 'theme_builder_upgrade_cta_clicked',
					target_location: 'theme_builder_promotional_popup',
					location_l1: locationL1,
				} );
			} catch {
				// Silently fail — analytics should never break production functionality.
			}
		},
		PromotionHoverElement = ( props ) => {
			const promotionUrlWithType = `${ promotionUrl }?type=${ props.type }`;
			return (
				<CardOverlay className="e-site-editor__promotion-overlay">
					<a className="e-site-editor__promotion-overlay__link" target="_blank" rel="noopener noreferrer" href={ promotionUrlWithType }>
						<i className="e-site-editor__promotion-overlay__icon eicon-lock" />
						<Button
							size="sm"
							color="brand"
							variant="contained"
							text={ __( 'Upgrade', 'elementor' ) }
							onClick={ () => trackUpgradeClick( `${ props.type }_upgrade_button` ) }
						/>
					</a>
				</CardOverlay>
			);
		};

	PromotionHoverElement.propTypes = {
		className: PropTypes.string,
		type: PropTypes.string.isRequired,
	};

	return (
		<Layout allPartsButton={ <AllPartsButton promotion /> } promotion>
			<section className="e-site-editor__promotion">
				<Grid container className="page-header">
					<Grid item sm={ 7 } justify="end">
						<Heading variant="h1">
							{ __( 'Customize every part of your site', 'elementor' ) }
						</Heading>
						<Text>
							{ __( 'Get total control, consistency and a faster workflow by designing the recurring parts that make up a complete website like the Header & Footer, Archive, 404, WooCommerce pages and more.', 'elementor' ) }
						</Text>
					</Grid>
					<Grid item container justify="end" alignItems="start" sm={ 5 }>
						<Button
							size="sm"
							color="cta"
							variant="contained"
							url={ promotionUrl }
							target="_blank"
							text={ __( 'Upgrade Now', 'elementor' ) }
							onClick={ () => trackUpgradeClick( 'main_upgrade_button' ) }
						/>
					</Grid>
				</Grid>
				<hr className="eps-separator" />
				<SiteParts hoverElement={ PromotionHoverElement } />
			</section>
		</Layout>
	);
}
