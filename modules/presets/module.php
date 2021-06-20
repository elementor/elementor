<?php
namespace Elementor\Modules\Presets;

use Elementor\Plugin;
use Elementor\Core\Experiments\Manager;
use Elementor\Core\Base\Module as Base_Module;
use Elementor\Modules\Presets\Data\Controller;
use Elementor\Modules\Presets\Documents\Preset;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Base_Module {
	public static function get_experimental_data() {
		return [
			'name' => 'presets',
			'title' => __( 'Presets', 'elementor' ),
			'description' => __( 'This is presets!!!', 'elementor' ),
			'release_status' => Manager::RELEASE_STATUS_ALPHA,
			'default' => Manager::STATE_INACTIVE,
		];
	}

	public function get_name() {
		return 'presets';
	}

	private function enqueue_scripts() {
		wp_enqueue_script(
			'editor-presets',
			$this->get_js_assets_url( 'editor-presets' ),
			[
				'elementor-common',
			],
			ELEMENTOR_VERSION,
			true
		);
	}

	private function set_active_presets_property( $config ) {
		$config['presets']['active_ids'] = [];

		if ( ! isset( $config['initial_document']['id'] ) ) {
			return $config;
		}

		$document = Plugin::$instance->documents->get( $config['initial_document']['id'] );

		if ( ! $document ) {
			return $config;
		}

		return $config;
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			$this->enqueue_scripts();
		} );

		add_filter( 'elementor/element/additional_raw_data', function ( $result, $data ) {
			return array_merge( [
				'presetId' => isset( $data['presetId'] ) ? $data['presetId'] : null,
			], $result );
		}, 10, 2 );

		add_filter( 'elementor/editor/localize_settings', function ( $config ) {
			return $this->set_active_presets_property( $config );
		} );

		Plugin::$instance->documents->register_document_type( Preset::TYPE, Preset::class );

		Plugin::$instance->data_manager->register_controller( Controller::class );
	}
}
