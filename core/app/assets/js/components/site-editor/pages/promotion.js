import React from 'react';
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
							Create Full Site
						</h1>
						<p>
							Site Editor is the industry leading all-in-one solution that lets you customize every part of your WordPress theme visually: Header, Footer, Single, Archive & WooCommerce
						</p>
						<a target="_blank" rel="noopener noreferrer" href={ this.promotionUrl }>
							Get Pro
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
					<span>{ `Get Pro` /* TODO: Translate. */ }</span>
				</div>
			);
		};
	}

	getTemplateTypes() {
		return [
			{
				id: 'header',
				icon: 'eicon-header',
				title: 'Header',
				urls: {
					docs: 'https://docs.elementor.com/site-editor-header',
				},
			},
			{
				id: 'footer',
				icon: 'eicon-footer',
				title: 'Footer',
				urls: {
					docs: 'https://docs.elementor.com/site-editor-footer',
				},
			},
			{
				id: 'single-post',
				icon: 'eicon-single-post',
				title: 'Single Post',
				urls: {
					docs: 'https://docs.elementor.com/site-editor-single-post',
				},
			},
			{
				id: 'error-404',
				icon: 'eicon-error-404',
				title: 'Error 404',
				urls: {
					docs: 'https://docs.elementor.com/site-editor-error-404',
				},
			},
			{
				id: 'search-results',
				icon: 'eicon-search-results',
				title: 'Search Results',
				urls: {
					docs: 'https://docs.elementor.com/site-editor-search-results',
				},
			},
			{
				id: 'archive',
				icon: 'eicon-archive',
				title: 'Archive',
				urls: {
					docs: 'https://docs.elementor.com/site-editor-archive',
				},
			},
			{
				id: 'product',
				icon: 'eicon-product-images',
				title: 'Product',
				urls: {
					docs: 'https://docs.elementor.com/site-editor-product',
				},
			},
			{
				id: 'products',
				icon: 'eicon-products',
				title: 'Products',
				urls: {
					docs: 'https://docs.elementor.com/site-editor-products',
				},
			},
			{
				id: 'custom',
				icon: 'eicon-custom',
				title: 'Custom',
				urls: {
					docs: 'https://docs.elementor.com/site-editor-custom',
				},
			},
		];
	}
}
