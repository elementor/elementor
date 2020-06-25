import Layout from '../templates/layout';
import SiteParts from '../organisms/site-parts';
import CardOverlay from 'elementor-app/ui/card/card-overlay';

import './promotion-overlay.scss';

export default function Promotion() {
	const promotionUrl = 'https://go.elementor.com/site-editor',
		PromotionHoverElement = ( props ) => {
			const promotionUrlWithType = `${ promotionUrl }?type=${ props.type }`;
			return (
				<CardOverlay className="promotion-overlay">
					<a className="promotion-overlay__link" target="_blank" rel="noopener noreferrer" href={ promotionUrlWithType }>
						<i className="promotion-overlay__icon eicon-lock" />
						<span className="promotion-overlay__button eps-button eps-button--sm eps-button--cta">{__( 'Get Pro', 'elementor' )}</span>
					</a>
				</CardOverlay>
			);
		};

	PromotionHoverElement.propTypes = {
		className: PropTypes.string,
		type: PropTypes.string.isRequired,
	};

	return (
		<Layout>
			<section className="elementor-app__site-editor__promotion">
				<div className="u-mb-20 u-d-flex">
					<div className="col-7">
						<h1>
							{ __( 'Create Full Site', 'elementor' ) }
						</h1>
						<p>
							{ __( 'Site Editor is the industry leading all-in-one solution that lets you customize every part of your WordPress theme visually: Header, Footer, Single, Archive & WooCommerce', 'elementor' ) }
						</p>
					</div>
					<div className="col-5 u-d-flex u-align-items-center u-justify-content-end">
						<a target="_blank" rel="noopener noreferrer" className="eps-button eps-button--sm eps-button--cta" href={ promotionUrl }>
							{ __( 'Get Pro', 'elementor' ) }
						</a>
					</div>
				</div>
				<hr className="u-mb-44"/>
				<SiteParts hoverElement={ PromotionHoverElement } />
			</section>
		</Layout>
	);
}

