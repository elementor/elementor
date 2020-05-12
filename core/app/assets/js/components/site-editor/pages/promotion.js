import React from 'react';
import { __ } from '@wordpress/i18n';
import Layout from '../templates/layout';
import SiteParts from './../organisms/site-parts';

export default class Promotion extends React.Component {
	promotionUrl = 'https://go.elementor.com/site-editor';

	render() {
		return (
			<Layout templateTypes={ this.getTemplateTypes() }>
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
					<SiteParts templateTypes={ this.getTemplateTypes() } hoverElement={ this.getHoverElement() } />
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

	getTemplateTypes() {
		return [
			{
				id: 'header',
				icon: 'eicon-header',
				title: __( 'Header', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-header',
				},
			},
			{
				id: 'footer',
				icon: 'eicon-footer',
				title: __( 'Footer', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-footer',
				},
			},
			{
				id: 'single-post',
				icon: 'eicon-single-post',
				title: __( 'Single Post', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-single-post',
				},
			},
			{
				id: 'error-404',
				icon: 'eicon-error-404',
				title: __( 'Error 404', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-error-404',
				},
			},
			{
				id: 'search-results',
				icon: 'eicon-search-results',
				title: __( 'Search Results', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-search-results',
				},
			},
			{
				id: 'archive',
				icon: 'eicon-archive',
				title: __( 'Archive', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-archive',
				},
			},
			{
				id: 'product',
				icon: 'eicon-product-images',
				title: __( 'Product', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-product',
				},
			},
			{
				id: 'products',
				icon: 'eicon-products',
				title: __( 'Products', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-products',
				},
			},
			{
				id: 'custom',
				icon: 'eicon-custom',
				title: __( 'Custom', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-custom',
				},
			},
		];
	}
}
