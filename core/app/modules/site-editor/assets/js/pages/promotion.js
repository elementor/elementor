import Layout from '../templates/layout';
import PromotionOverlay from '../molecules/promotion-overlay';
import SiteParts from './../organisms/site-parts';

export default function Promotion() {
	const promotionUrl = 'https://go.elementor.com/site-editor',
		PromotionHoverElement = ( props ) => {
			return <PromotionOverlay type={ props.type } promotionUrl={ promotionUrl }/>;
		};

	return (
		<Layout>
			<section className="elementor-app__site-editor__promotion">
				<div>
					<h1>
						{ __( 'Create Full Site', 'elementor' ) }
					</h1>
					<p>
						{ __( 'Site Editor is the industry leading all-in-one solution that lets you customize every part of your WordPress theme visually: Header, Footer, Single, Archive & WooCommerce', 'elementor' ) }
					</p>
					<a target="_blank" rel="noopener noreferrer" href={ promotionUrl }>
						{ __( 'Get Pro', 'elementor' ) }
					</a>
				</div>
				<SiteParts hoverElement={ PromotionHoverElement } />
			</section>
		</Layout>
	);
}
