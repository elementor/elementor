<?php
namespace Elementor\Modules\NestedAccordion;

use Elementor\Plugin;
use Elementor\Core\Base\Module as BaseModule;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( 'nested-elements' );
	}

	public function get_name() {
		return 'nested-accordion';
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'elementor/widgets/additional_widgets_styles', [ $this, 'register_widget_styles' ] );

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			wp_enqueue_script( $this->get_name(), $this->get_js_assets_url( $this->get_name() ), [
				'nested-elements',
			], ELEMENTOR_VERSION, true );
		} );

	}

	/**
	 * Registered widget styles.
	 * 
	 * At build time, Elementor compiles `/modules/nested-accordion/assets/scss/frontend.scss`
	 * to `/assets/css/widget-nested-accordion.min.css`.
	 *
	 * @return array
	 */
	public function register_widget_styles( array $additional_widgets_styles ) : array {
		$additional_widgets_styles[] = [
			'handle' => 'widget-nested-accordion',
			'file_path' => $this->get_css_assets_url( 'widget-nested-accordion', null, true, true ),
		];

		return $additional_widgets_styles;
	}
}
