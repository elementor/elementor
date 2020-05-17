/**
 * App Loader
 *
 * TODO: Temporary solution for routing extensibility and share components.
 */

import React from 'react';
import { __ } from '@wordpress/i18n';
import * as library from './components-library';

class AppLoader {
	library = library;

	/**
	 * @type {*[]}
	 */
	routes = [];

	/**
	 * @type {*[]}
	 */
	data = {
		template_types: [
			{
				type: 'header',
				icon: 'eicon-header',
				title: __( 'Header', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-header',
				},
			},
			{
				type: 'footer',
				icon: 'eicon-footer',
				title: __( 'Footer', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-footer',
				},
			},
			{
				type: 'single-post',
				icon: 'eicon-single-post',
				title: __( 'Single Post', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-single-post',
				},
			},
			{
				type: 'error-404',
				icon: 'eicon-error-404',
				title: __( 'Error 404', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-error-404',
				},
			},
			{
				type: 'search-results',
				icon: 'eicon-search-results',
				title: __( 'Search Results', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-search-results',
				},
			},
			{
				type: 'archive',
				icon: 'eicon-archive',
				title: __( 'Archive', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-archive',
				},
			},
			{
				type: 'product',
				icon: 'eicon-product-images',
				title: __( 'Product', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-product',
				},
			},
			{
				type: 'products',
				icon: 'eicon-products',
				title: __( 'Products', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-products',
				},
			},
			{
				type: 'custom',
				icon: 'eicon-custom',
				title: __( 'Custom', 'elementor' ),
				urls: {
					docs: 'https://docs.elementor.com/site-editor-custom',
				},
			},
		],
	};

	getData( endpoint ) {
		return this.data[ endpoint ] || {};
	}

	setData( endpoint, data ) {
		return this.data[ endpoint ] = data;
	}

	/**
	 *
	 * @param route {{
	 *		path: string,
	 *		component: object,
	 *		props: object,
	 * }}
	 */
	addRoute( route ) {
		this.routes.push( route );
	}

	/**
	 *
	 * @param app
	 */
	getRoutes( app ) {
		this.app = app;

		return this.routes.map( ( route ) => {
			const props = route.props || {};
			// Use the path as a key, and add it as a prop.
			props.path = props.key = route.path;
			return React.createElement( route.component, props );
		} );
	}
}

window.elementorAppLoader = new AppLoader();
