<?php
namespace Elementor\Modules\V4Widgets;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'e_v4_widgets';
	const SAMPLE_DEFINITION_FILE = 'schema/examples/icon-button.json';
	const EDITOR_DEFINITION_KEYS = [ 'id', 'version', 'title', 'icon', 'template' ];

	public function get_name() {
		return 'v4-widgets';
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'V4 Widgets', 'elementor' ),
			'description' => esc_html__( 'Enable V4 widgets: ready-made compositions of atomic elements.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public static function is_active() {
		return Atomic_Widgets_Module::is_active();
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'elementor/editor/localize_settings', fn ( $settings ) => $this->add_editor_settings( $settings ) );
	}

	private function add_editor_settings( array $settings ): array {
		$definition = $this->load_sample_definition();

		if ( ! $definition ) {
			return $settings;
		}

		$settings['v4Widgets'] = [
			$definition['id'] => array_intersect_key( $definition, array_flip( self::EDITOR_DEFINITION_KEYS ) ),
		];

		if ( isset( $settings['elementsPresets'] ) ) {
			$settings['elementsPresets'][ $this->get_panel_tile_key( $definition ) ] = $this->build_panel_tile( $definition );
		}

		return $settings;
	}

	private function load_sample_definition(): ?array {
		$definition = wp_json_file_decode( __DIR__ . '/' . self::SAMPLE_DEFINITION_FILE, [ 'associative' => true ] );

		if ( ! is_array( $definition ) || empty( $definition['id'] ) || empty( $definition['template']['elType'] ) ) {
			return null;
		}

		return $definition;
	}

	private function get_panel_tile_key( array $definition ): string {
		return 'v4-widget-' . str_replace( '/', '-', $definition['id'] );
	}

	/**
	 * TEMPORARY: reuses the legacy container-presets channel only to test inserting a widget tree.
	 * Real panel tiles and categories are a separate ticket.
	 */
	private function build_panel_tile( array $definition ): array {
		return [
			'replacements' => [
				'name' => $this->get_panel_tile_key( $definition ),
				'title' => $definition['title'],
				'icon' => $definition['icon'] ?? 'eicon-apps',
				'custom' => [
					'originalWidget' => $definition['template']['elType'],
					'v4WidgetId' => $definition['id'],
				],
			],
		];
	}
}
