<?php
namespace Elementor\Modules\PerformanceLab;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {


	public function get_name() {
		return 'performance-lab';
	}

	private function does_performance_lab_is_active() {
		if ( function_exists( 'webp_uploads_img_tag_update_mime_type' ) ) {
			$webp_option_name = 'site-health/webp-support';
			$perflab_modules_settings = get_option( 'perflab_modules_settings' );
			if ( isset( $perflab_modules_settings ) && isset( $perflab_modules_settings[ $webp_option_name ] ) &&
							'1' === $perflab_modules_settings[ $webp_option_name ]['enabled'] ) {
				return true;
			}
		}
		return false;
	}

	private function performance_lab_get_webp_src( $attachment_id, $size = 'full', $url ) {
		if ( $this->does_performance_lab_is_active() ) {
				$image_object = wp_get_attachment_image_src( $attachment_id, $size );
				$image_src = webp_uploads_img_tag_update_mime_type( $image_object[0], 'webp', $attachment_id );
			if ( ! empty( $image_src ) ) {
				return $image_src;
			}
		}
		return $url;
	}


	public function __construct() {

		parent::__construct();

		if ( $this->does_performance_lab_is_active() ) {
			add_filter('elementor/css-file/css_property', function( $value, $css_property, $matches, $control ) {
				if ( 0 === strpos( $css_property, 'background-image' ) && '{{URL}}' === $matches[0] ) {
					$value['url'] = $this->performance_lab_get_webp_src( $value['id'], 'full', $value['url'] );
				}
				return $value;
			}, 10, 4 );
		}

		add_action( 'activated_plugin', function( $plugin ) {
			if ( 'performance-lab/load.php' === $plugin ) {
				Plugin::$instance->files_manager->clear_cache();
			}
		} );

		add_action( 'deactivated_plugin', function( $plugin ) {
			if ( 'performance-lab/load.php' === $plugin ) {
				Plugin::$instance->files_manager->clear_cache();
			}
		} );

	}
}
