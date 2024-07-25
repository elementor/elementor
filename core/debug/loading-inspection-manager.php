<?php
namespace Elementor\Core\Debug;

use Elementor\Core\Debug\Classes\Inspection_Base;
use Elementor\Core\Debug\Classes\Theme_Missing;
use Elementor\Core\Debug\Classes\Htaccess;
use Elementor\Utils;

class Loading_Inspection_Manager {

	public static $_instance = null;

	public static function instance() {
		if ( null === self::$_instance ) {
			self::$_instance = new Loading_Inspection_Manager();
		}
		return self::$_instance;
	}

	/** @var Inspection_Base[] */
	private $inspections = [];

	public function register_inspections() {
		$this->inspections['theme-missing'] = new Theme_Missing();
		$this->inspections['htaccess'] = new Htaccess();
	}

	/**
	 * @param Inspection_Base $inspection
	 */
	public function register_inspection( $inspection ) {
		$this->inspections[ $inspection->get_name() ] = $inspection;
	}

	public function run_inspections() {
		if ( Utils::get_super_global_value( $_GET, 'post' ) == get_option( 'woocommerce_shop_page_id' ) ) {
			$debug_data = [
				'message' => esc_html__( 'You are trying to edit the Shop Page although it is a Product Archive. Use the Theme Builder to create your Shop Archive template instead.', 'elementor' ),
				'header' => esc_html__( 'Sorry, The content area was not been found on your page', 'elementor' ),
				'doc_url' => 'https://elementor.com/help/the-content-area-was-not-found-error/#error-appears-on-woocommerce-pages',
			];

			return $debug_data;
		}

		$debug_data = [
			'message' => esc_html__( "We’re sorry, but something went wrong. Click on 'Learn more' and follow each of the steps to quickly solve it.", 'elementor' ),
			'header' => esc_html__( 'The preview could not be loaded', 'elementor' ),
			'doc_url' => 'https://go.elementor.com/preview-not-loaded/',
		];
		foreach ( $this->inspections as $inspection ) {
			if ( ! $inspection->run() ) {
				$debug_data = [
					'message' => $inspection->get_message(),
					'header' => $inspection->get_header_message(),
					'doc_url' => $inspection->get_help_doc_url(),
					'error' => true,
				];
				break;
			}
		}

		return $debug_data;
	}
}
