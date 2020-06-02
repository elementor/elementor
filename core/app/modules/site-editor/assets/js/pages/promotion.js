import Layout from '../templates/layout';
import SiteParts from './../organisms/site-parts';

export default function Promotion() {
	const promotionUrl = 'https://go.elementor.com/site-editor';

	const PromotionHoverElement = ( props ) => {
		const promotionUrlWithType = `${ promotionUrl }?type=${ props.type }`;

		return (
			<a target="_blank" rel="noopener noreferrer" href={ promotionUrlWithType }>
				<i className="eicon-lock" />
				<span>
				{ __( 'Get Pro', 'elementor' ) }
			</span>
			</a>
		);
	};

	PromotionHoverElement.propTypes = {
		type: PropTypes.string,
	};

	return (
		<Layout>
			<section className="e-app__site-editor__promotion">
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
