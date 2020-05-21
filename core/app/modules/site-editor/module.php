<?php
namespace Elementor\Core\App\Modules\SiteEditor;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Site Editor Module
 *
 * Responsible for initializing Elementor App functionality
 */
class Module extends BaseModule {
	/**
	 * Get name.
	 *
	 * @access public
	 *
	 * @return string
	 */
	public function get_name() {
		return 'site-editor';
	}

	public function get_template_types() {
		return [
			[
				'type' => 'header',
				'icon' => 'eicon-header',
				'title' => __( 'Header', 'elementor' ),
				'urls' => [
					'docs' => 'https://docs.elementor.com/site-editor-header',
				],
			],
			[
				'type' => 'footer',
				'icon' => 'eicon-footer',
				'title' => __( 'Footer', 'elementor' ),
				'urls' => [
					'docs' => 'https://docs.elementor.com/site-editor-footer',
				],
			],
			[
				'type' => 'single-post',
				'icon' => 'eicon-single-post',
				'title' => __( 'Single Post', 'elementor' ),
				'urls' => [
					'docs' => 'https://docs.elementor.com/site-editor-single-post',
				],
			],
			[
				'type' => 'error-404',
				'icon' => 'eicon-error-404',
				'title' => __( 'Error 404', 'elementor' ),
				'urls' => [
					'docs' => 'https://docs.elementor.com/site-editor-error-404',
				],
			],
			[
				'type' => 'search-results',
				'icon' => 'eicon-search-results',
				'title' => __( 'Search Results', 'elementor' ),
				'urls' => [
					'docs' => 'https://docs.elementor.com/site-editor-search-results',
				],
			],
			[
				'type' => 'archive',
				'icon' => 'eicon-archive',
				'title' => __( 'Archive', 'elementor' ),
				'urls' => [
					'docs' => 'https://docs.elementor.com/site-editor-archive',
				],
			],
			[
				'type' => 'product',
				'icon' => 'eicon-product-images',
				'title' => __( 'Product', 'elementor' ),
				'urls' => [
					'docs' => 'https://docs.elementor.com/site-editor-product',
				],
			],
			[
				'type' => 'products',
				'icon' => 'eicon-products',
				'title' => __( 'Products', 'elementor' ),
				'urls' => [
					'docs' => 'https://docs.elementor.com/site-editor-products',
				],
			],
			[
				'type' => 'custom',
				'icon' => 'eicon-custom',
				'title' => __( 'Custom', 'elementor' ),
				'urls' => [
					'docs' => 'https://docs.elementor.com/site-editor-custom',
				],
			],
		];
	}

	/**
	 * Register ajax actions.
	 *
	 * @access public
	 *
	 * @param Ajax $ajax
	 */
	public function register_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( 'app_site_editor_template_types', [ $this, 'get_template_types' ] );
	}

	/**
	 * Module constructor.
	 *
	 * @access public
	 */
	public function __construct() {
		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
	}
}
