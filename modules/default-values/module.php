<?php
namespace Elementor\Modules\DefaultValues;

use Elementor\Plugin;
use ElementorPro\Base\Base_Widget;
use Elementor\Core\Utils\Collection;
use Elementor\Core\Experiments\Manager;
use Elementor\Core\Files\CSS\Global_CSS;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\DefaultValues\Data\Controller;
use Elementor\Modules\DefaultValues\Data\Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	/**
	 * @return string
	 */
	public function get_name() {
		return 'default-values';
	}

	/**
	 * @return array
	 */
	public static function get_experimental_data() {
		return [
			'name' => 'default-values',
			'title' => __( 'Default Values', 'elementor' ),
			'description' => __( 'This is default values!', 'elementor' ),
			'release_status' => Manager::RELEASE_STATUS_ALPHA,
			'default' => Manager::STATE_INACTIVE,
		];
	}

	private function enqueue_scripts() {
		wp_enqueue_script(
			'editor-default-values',
			$this->get_js_assets_url( 'editor-default-values' ),
			[ 'elementor-common' ],
			ELEMENTOR_VERSION,
			true
		);
	}

	/**
	 * Run over widget config and replace the controls default values with
	 * the dynamic default values + it add 'hardcoded-default' property to allow create new default value based on them and not
	 * based on the dynamic default values.
	 *
	 * @param array $widget_config
	 * @param       $widget
	 *
	 * @return array
	 * @throws \Exception
	 */
	private function add_default_to_widget_config( array $widget_config, $widget ) {
		$dynamic_defaults = new Collection( Repository::instance()->get( $widget->get_name() )['settings'] );

		$global_defaults = ( new Collection( $dynamic_defaults->get( '__globals__', [] ) ) )
			->filter( function ( $value, $key ) use ( $widget_config ) {
				return isset( $widget_config['controls'][ $key ] );
			} );

		$local_defaults = $dynamic_defaults
			->filter( function ( $value, $key ) use ( $widget_config ) {
				return '__globals__' !== $key && isset( $widget_config['controls'][ $key ] );
			} );


		foreach ( $widget_config['controls'] as $control_key => $control_value ) {
			$global_default_value = $global_defaults->get( $control_key );
			$local_default_value = $local_defaults->get( $control_key );

			if ( isset( $widget_config['controls'][ $control_key ]['default'] ) ) {
				$widget_config['controls'][ $control_key ]['hardcoded_default'] = $widget_config['controls'][ $control_key ]['default'];
			}

			if ( isset( $widget_config['controls'][ $control_key ]['global']['default'] ) ) {
				$widget_config['controls'][ $control_key ]['global']['hardcoded_default'] = $widget_config['controls'][ $control_key ]['global']['default'];
			}

			if ( $global_default_value ) {
				$widget_config['controls'][ $control_key ]['global']['default'] = $global_default_value;
			}

			if ( $local_default_value ) {
				$widget_config['controls'][ $control_key ]['default'] = $local_default_value;
			}
		}

		return $widget_config;
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			$this->enqueue_scripts();
		} );

		add_filter( 'elementor/data/widgets-config/prepare-for-response', function ( array $widget_config, $widget ) {
			return $this->add_default_to_widget_config( $widget_config, $widget );
		}, 10, 2 );

		Plugin::$instance->data_manager->register_controller( Controller::class );
	}
}
