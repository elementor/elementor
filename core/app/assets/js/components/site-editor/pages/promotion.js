import Layout from '../templates/layout';
import SiteParts from './../organisms/site-parts';

export default class Promotion extends React.Component {
	promotionUrl = 'https://go.elementor.com/site-editor';

	render() {
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
						<a target="_blank" rel="noopener noreferrer" href={ this.promotionUrl }>
							{ __( 'Get Pro', 'elementor' ) }
						</a>
					</div>
					<SiteParts hoverElement={ this.getHoverElement() } />
				</section>
			</Layout>
		);
	}

	/**
	 *  An hover element for each site part.
	 */
	getHoverElement() {
		const onHoverClick = ( itemProps ) => {
			globalThis.open( `${ this.promotionBaseUrl }?type=${ itemProps.type }` );
		};

		return ( props ) => {
			return (
				<div onClick={ () => onHoverClick( props ) }>
					<i className="eicon-lock" />
					<span>
						{ __( 'Get Pro', 'elementor' ) }
					</span>
				</div>
			);
		};
	}
}
