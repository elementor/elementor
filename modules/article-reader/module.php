<?php
namespace Elementor\Modules\ArticleReader;

use Elementor\Core\Experiments\Manager;
use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {


	public function get_name() {
		return 'article-reader';
	}

	public static function get_experimental_data() {
		return [
			'name' => 'article-reader',
			'title' => esc_html__( 'Elementor Article Reader', 'elementor' ),
			'description' => esc_html__( 'Multilingual Article Reader based on Google Speech Synthesis API & WP locale settings', 'elementor' ),
			'release_status' => Manager::RELEASE_STATUS_BETA,
			'new_site' => [
				'default_active' => true,
			],
		];
	}

	protected function get_widgets() {
		return [
			'ArticleReader',
		];
	}


	public function frontend_styles() {
		wp_register_style( 'frontend-style-1', plugins_url( '/assets/css/article-reader.css', __FILE__ ) );
		wp_enqueue_style( 'frontend-style-1' );
	}

	public function frontend_scripts() {
		wp_register_script( 'frontend-script-1', plugins_url( '/assets/js/article-reader.js', __FILE__ ) );
		wp_enqueue_script( 'frontend-script-1' );

	}

	public function __construct() {
		parent::__construct();
		add_action( 'elementor/frontend/after_register_scripts', [ $this, 'frontend_scripts' ] );
		add_action( 'elementor/frontend/after_enqueue_styles', [ $this, 'frontend_styles' ] );
	}


}

?>