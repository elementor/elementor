import router from '@elementor/router';
import SiteEditorPromotion from './pages/promotion';
import NotFound from './pages/not-found';

export default class SiteEditor {
	constructor() {
		this.saveTemplateTypesToCache();

		router.addRoute( {
			path: '/site-editor/promotion',
			component: SiteEditorPromotion,
		} );

		router.addRoute( {
			path: '/site-editor/*',
			component: NotFound,
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
				},
				tooltip_data: {
					title: __( 'What is a Global Header?', 'elementor' ),
					content: __( 'The Global Header allows you to easily design and edit custom WordPress headers so you are no longer constrained by your theme’s header design limitations.', 'elementor' ),
					tip: __( 'You can create multiple headers, and assign each to different areas of your site.', 'elementor' ),
					docs: 'https://go.elementor.com/app-theme-builder-header',
					video_url: 'https://www.youtube.com/embed/tDePkL-1tu4',
				},
			},
			{
				type: 'footer',
				icon: 'eicon-footer',
				title: __( 'Footer', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/footer.svg',
				},
				tooltip_data: {
					title: __( 'What is a Global Footer?', 'elementor' ),
					content: __( 'The Global Footer allows you to easily design and edit custom WordPress footers without the limits of your theme’s footer design constraints', 'elementor' ),
					tip: __( 'You can create multiple footers, and assign each to different areas of your site.', 'elementor' ),
					docs: 'https://go.elementor.com/app-theme-builder-footer',
					video_url: 'https://www.youtube.com/embed/ob7SMEfVRfc',
				},
			},
			{
				type: 'single-page',
				icon: 'eicon-single-page',
				title: __( 'Single Page', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/single-page.svg',
				},
				tooltip_data: {
					title: __( 'What is a Global Page?', 'elementor' ),
					content: __( 'A global page template allows you to easily create the layout and style of pages, ensuring design consistency across all the pages of your site.', 'elementor' ),
					tip: __( 'You can create multiple global page templates, and assign each to different areas of your site.', 'elementor' ),
					docs: 'https://go.elementor.com/app-theme-builder-page',
					video_url: 'https://www.youtube.com/embed/5LWrOIAGOsc',
				},
			},
			{
				type: 'single-post',
				icon: 'eicon-single-post',
				title: __( 'Single Post', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/single-post.svg',
				},
				tooltip_data: {
					title: __( 'What is a Global Post?', 'elementor' ),
					content: __( 'A global post template allows you to easily design the layout and style of posts, ensuring a design consistency throughout all your blog posts, for example.', 'elementor' ),
					tip: __( 'You can create multiple global post templates, and assign each to a different category.', 'elementor' ),
					docs: 'https://go.elementor.com/app-theme-builder-post',
					video_url: 'https://www.youtube.com/embed/KMPVOt_1F2A',
				},
			},
			{
				type: 'archive',
				icon: 'eicon-archive',
				title: __( 'Archive', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/archive.svg',
				},
				tooltip_data: {
					title: __( 'What is a Global Archive?', 'elementor' ),
					content: __( 'A global archive template allows you to easily design the layout and style of archive pages - those pages that show a list of posts (e.g. a blog’s list of recent posts), which may be filtered by terms such as authors, categories, tags, search results, etc.', 'elementor' ),
					tip: __( 'If you’d like a different style for a specific category, it’s easy to create a separate global archive template whose condition is to only display when users are viewing that category’s list of posts.', 'elementor' ),
					docs: 'https://go.elementor.com/app-theme-builder-archive',
					video_url: __( 'https://www.youtube.com/embed/7rDIS1Li4jM', 'elementor' ),
				},
			},
			{
				type: 'search-results',
				icon: 'eicon-search-results',
				title: __( 'Search Results', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/search-results.svg',
				},
				tooltip_data: {
					title: __( 'What are Search Results templates?', 'elementor' ),
					content: __( 'You can easily control the layout and design of the Search Results page with the Search Results template, which is simply a special archive template just for displaying search results.', 'elementor' ),
					tip: __( 'You can customize the message if there are no results for the search term.', 'elementor' ),
					docs: 'https://go.elementor.com/app-theme-builder-search-results',
					video_url: 'https://www.youtube.com/embed/kPAUEShgdoo',
				},
			},
			{
				type: 'product',
				icon: 'eicon-single-product',
				title: __( 'Product', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/product.svg',
				},
				tooltip_data: {
					title: __( 'What is a Global Product?', 'elementor' ),
					content: __( 'A global product template allows you to easily design the layout and style of WooCommerce single product pages, and apply that template to various conditions that you assign.', 'elementor' ),
					tip: __( 'You can create multiple global product templates, and assign each to different types of products, enabling a custom design for each group of similar products.', 'elementor' ),
					docs: 'https://go.elementor.com/app-theme-builder-product',
					video_url: 'https://www.youtube.com/embed/F2gyAeZdU9s',
				},
			},
			{
				type: 'products',
				icon: 'eicon-products',
				title: __( 'Products', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/products.svg',
				},
				tooltip_data: {
					title: __( 'What is a Global Products Archive?', 'elementor' ),
					content: __( 'A global archive product template allows you to easily design the layout and style of your WooCommerce shop page or other product archive pages - those pages that show a list of products, which may be filtered by terms such as categories, tags, etc.', 'elementor' ),
					tip: __( 'You can create multiple global archive product templates, and assign each to different categories of products. This gives you the freedom to customize the appearance for each type of product being shown.', 'elementor' ),
					docs: 'https://go.elementor.com/app-theme-builder-products-archive',
					video_url: 'https://www.youtube.com/embed/F2gyAeZdU9s',
				},
			},
			{
				type: 'error-404',
				icon: 'eicon-error-404',
				title: __( 'Error 404', 'elementor' ),
				urls: {
					thumbnail: elementorAppConfig.assets_url + '/images/app/site-editor/error-404.svg',
				},
				tooltip_data: {
					title: __( 'What is a 404 Page?', 'elementor' ),
					content: __( 'A 404 page template allows you to easily design the layout and style of the page that is displayed when a visitor arrives at a page that does not exist.', 'elementor' ),
					tip: __( 'Keep your site\'s visitors happy when they get lost by displaying your recent posts, a search bar, or any information that might help the user find what they were looking for.', 'elementor' ),
					docs: 'https://go.elementor.com/app-theme-builder-404',
					video_url: 'https://www.youtube.com/embed/Z2GoYYbWciU',
				},
			},
			];
	}
}
