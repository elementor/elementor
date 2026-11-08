<?php
namespace Elementor\Modules\CompositeWidgets;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'e_composite_widgets';
	const SAMPLE_DEFINITION_FILE = 'schema/examples/icon-button.json';
	const EDITOR_DEFINITION_KEYS = [ 'id', 'version', 'title', 'icon', 'template' ];

	const PACKAGES = [
		'editor-composite-widgets',
	];

	public function get_name() {
		return 'composite-widgets';
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Composite Widgets', 'elementor' ),
			'description' => esc_html__( 'Enable composite widgets: ready-made compositions of atomic elements.', 'elementor' ),
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

		add_filter( 'elementor/editor/v2/packages', fn ( $packages ) => $this->add_packages( $packages ) );
		add_filter( 'elementor/editor/localize_settings', fn ( $settings ) => $this->add_editor_settings( $settings ) );
	}

	private function add_packages( array $packages ): array {
		return array_merge( $packages, self::PACKAGES );
	}

	private function add_editor_settings( array $settings ): array {
		$definition = $this->load_sample_definition();

		if ( ! $definition ) {
			return $settings;
		}

		$settings['compositeWidgets'] = [
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
		return 'composite-widget-' . str_replace( '/', '-', $definition['id'] );
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
					'compositeWidgetId' => $definition['id'],
				],
			],
		];
	}
}
