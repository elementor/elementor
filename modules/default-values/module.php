<?php
namespace Elementor\Modules\DefaultValues;

use Elementor\Plugin;
use Elementor\Controls_Stack;
use Elementor\Core\Utils\Collection;
use Elementor\Core\Experiments\Manager;
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
			'title' => esc_html__( 'Custom Default Widget Styles', 'elementor' ),
			'description' => esc_html__( 'Define the custom style settings of a widget as the default for other widgets when they are dragged onto the editor. This will help manage your site’s design system and keep your styling consistent.', 'elementor' ),
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

	private function update_control_defaults( Controls_Stack $element ) {
		$dynamic_defaults = new Collection(
			Repository::instance()->get( $element->get_name() )['settings']
		);

		$this->update_local_control_defaults( $element, $dynamic_defaults );
		$this->update_global_control_defaults( $element, $dynamic_defaults );
	}

	private function update_local_control_defaults( Controls_Stack $element, Collection $defaults ) {
		$local_defaults = $defaults->filter( function ( $value, $key ) {
			return '__globals__' !== $key;
		} );

		foreach ( $local_defaults as $setting_name => $value ) {
			$control = $element->get_controls( $setting_name );

			if ( ! $control ) {
				continue;
			}

			$element->update_control(
				$setting_name,
				$this->prepare_default_data_for_update(
					$control,
					$value
				),
				[ 'recursive' => true ]
			);
		}
	}

	private function update_global_control_defaults( Controls_Stack $element, Collection $defaults ) {
		$global_defaults = new Collection(
			$defaults->get( '__globals__', [] )
		);

		foreach ( $global_defaults as $setting_name => $value ) {
			$control = $element->get_controls( $setting_name );

			if ( ! $control ) {
				continue;
			}

			$element->update_control(
				$setting_name,
				[
					'global' => $this->prepare_default_data_for_update(
						isset( $control['global'] ) ? $control['global'] : [],
						$value
					),
				],
				[ 'recursive' => true ]
			);
		}
	}

	private function prepare_default_data_for_update( array $control, $value ) {
		$data = [ 'default' => $value ];

		if ( isset( $control['default'] ) ) {
			$data['hardcoded_default'] = $control['default'];
		}

		return $data;
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			$this->enqueue_scripts();
		} );

		add_action( 'elementor/control_stack/controls/init', function ( Controls_Stack $element ) {
			$this->update_control_defaults( $element );
		} );

		Plugin::$instance->data_manager_v2->register_controller( new Controller() );
	}
}
