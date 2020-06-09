import router from '@elementor/router';
import SiteEditorPromotion from './pages/promotion';

export default class SiteEditor {
	constructor() {
		this.saveTemplateTypesToCache();

		router.addRoute( {
			path: '/site-editor/promotion',
			component: SiteEditorPromotion,
		} );
	}

	saveTemplateTypesToCache() {
		const types = this.getTypes();
		elementorCommon.ajax.addRequestCache( {
			unique_id: 'app_site_editor_template_types',
		}, types );
	}

	getTypes() {
		return [
			{
				type: 'header',
				icon: 'eicon-header',
				title: __( 'Header', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/header.svg',
					docs: 'https://docs.elementor.com/site-editor-header',
				},
			},
			{
				type: 'footer',
				icon: 'eicon-footer',
				title: __( 'Footer', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/footer.svg',
					docs: 'https://docs.elementor.com/site-editor-footer',
				},
			},
			{
				type: 'single-page',
				icon: 'eicon-single-page',
				title: __( 'Single Page', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/single-page.svg',
					docs: 'https://docs.elementor.com/site-editor-single-page',
				},
			},
			{
				type: 'single-post',
				icon: 'eicon-single-post',
				title: __( 'Single Post', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/single-post.svg',
					docs: 'https://docs.elementor.com/site-editor-single-post',
				},
			},
			{
				type: 'archive',
				icon: 'eicon-archive',
				title: __( 'Archive', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/archive.svg',
					docs: 'https://docs.elementor.com/site-editor-archive',
				},
			},
			{
				type: 'search-results',
				icon: 'eicon-search-results',
				title: __( 'Search Results', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/search-results.svg',
					docs: 'https://docs.elementor.com/site-editor-search-results',
				},
			},
			{
				type: 'product',
				icon: 'eicon-product',
				title: __( 'Product', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/product.svg',
					docs: 'https://docs.elementor.com/site-editor-product',
				},
			},
			{
				type: 'products',
				icon: 'eicon-products',
				title: __( 'Products', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/products.svg',
					docs: 'https://docs.elementor.com/site-editor-products',
				},
			},
			{
				type: 'custom',
				icon: 'eicon-custom',
				title: __( 'Custom', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/custom.svg',
					docs: 'https://docs.elementor.com/site-editor-custom',
				},
			},
			{
				type: 'error-404',
				icon: 'eicon-error-404',
				title: __( 'Error 404', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/error-404.svg',
					docs: 'https://docs.elementor.com/site-editor-error-404',
				},
			},
			];
	}
}
