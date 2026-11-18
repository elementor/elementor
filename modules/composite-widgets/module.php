<?php
namespace Elementor\Modules\CompositeWidgets;

use Elementor\Core\Base\Document;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use Elementor\Modules\CompositeWidgets\ClosedStructure\Closed_Structure;
use Elementor\Modules\CompositeWidgets\Definitions\Definition_Migrator;
use Elementor\Modules\CompositeWidgets\Definitions\Site_Definitions_Registrar;
use Elementor\Modules\CompositeWidgets\Definitions\Validation\Widget_Definition_Validator;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Site\Site_Widgets_Access_Controller;
use Elementor\Modules\CompositeWidgets\Site\Site_Widgets_Visibility;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const MODULE_NAME = 'composite-widgets';
	const EXPERIMENT_NAME = 'e_composite_widgets';
	const REGISTER_HOOK = 'elementor/composite-widgets/register';
	const REGISTER_SITE_HOOK = 'elementor/composite-widgets/register-site';
	const CORE_DEFINITION_FILES = [
		'schema/examples/icon-button.json',
	];
	const EDITOR_DEFINITION_KEYS = [ 'id', 'version', 'title', 'icon', 'template', 'general' ];
	const SYNC_LOCKS_PRIORITY = 20;

	const PACKAGES = [
		'editor-composite-widgets',
	];

	private ?Widgets_Definitions_Registry $registry = null;
	private ?Closed_Structure $closed_structure = null;
	/**
	 * The site provider loads its saved widget documents while the registry is built, and each load runs
	 * the lock sync, which needs the registry: without this flag the build would start over without end.
	 *
	 * @var bool
	 */
	private bool $is_building_registry = false;

	public function get_name() {
		return self::MODULE_NAME;
	}

	/**
	 * Null while the experiment is off: the module isn't loaded, and widget instances are plain atoms.
	 */
	public static function get_active_closed_structure(): ?Closed_Structure {
		$module = Plugin::$instance->modules_manager->get_modules( self::MODULE_NAME );

		return $module instanceof self ? $module->get_closed_structure() : null;
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

		( new Definitions_REST_API( fn () => $this->get_editor_definitions() ) )->register_hooks();

		add_filter( 'elementor/editor/v2/packages', fn ( $packages ) => $this->add_packages( $packages ) );
		add_filter( 'elementor/editor/localize_settings', fn ( $settings ) => $this->add_editor_settings( $settings ) );
		add_filter( 'elementor/document/load/data', fn ( $data, $document ) => $this->sync_widget_locks( $data, $document ), self::SYNC_LOCKS_PRIORITY, 2 );

		( new Site_Widgets_Visibility() )->register_hooks();
	}

	/**
	 * Built on first access, so every atomic element type is registered by the time definitions are validated.
	 * Site definitions come first, from the site provider (Elementor Pro), then code definitions.
	 */
	public function get_registry(): Widgets_Definitions_Registry {
		if ( null === $this->registry ) {
			$this->is_building_registry = true;

			try {
				$this->registry = new Widgets_Definitions_Registry(
					Widget_Definition_Validator::make(),
					new Definition_Migrator( Migrations_Orchestrator::make() ),
					fn ( Site_Definitions_Registrar $registrar ) => do_action( self::REGISTER_SITE_HOOK, $registrar )
				);

				$this->register_core_definitions( $this->registry );

				do_action( self::REGISTER_HOOK, $this->registry );
			} finally {
				$this->is_building_registry = false;
			}
		}

		return $this->registry;
	}

	public function get_closed_structure(): Closed_Structure {
		if ( null === $this->closed_structure ) {
			$this->closed_structure = new Closed_Structure( $this->get_registry() );
		}

		return $this->closed_structure;
	}

	private function register_core_definitions( Widgets_Definitions_Registry $registry ): void {
		foreach ( self::CORE_DEFINITION_FILES as $file ) {
			$registry->register_from_json( __DIR__ . '/' . $file );
		}
	}

	/**
	 * Editor loads only, after the prop-type migrations.
	 */
	private function sync_widget_locks( $data, $document ) {
		if (
			$this->is_building_registry
			|| ! is_array( $data )
			|| ! $document instanceof Document
			|| ! Closed_Structure::contains_widget_root( $data )
			|| ! Plugin::$instance->editor->is_edit_mode( $document->get_main_id() )
		) {
			return $data;
		}

		return $this->get_closed_structure()->sync_locks( $data );
	}

	private function add_packages( array $packages ): array {
		return array_merge( $packages, self::PACKAGES );
	}

	private function add_editor_settings( array $settings ): array {
		$settings['compositeWidgets'] = $this->get_editor_definitions();

		if ( isset( $settings['elementsPresets'] ) ) {
			foreach ( $this->get_registry()->all() as $definition ) {
				if ( ! $this->can_insert( $definition ) ) {
					continue;
				}

				$settings['elementsPresets'][ $this->get_panel_tile_key( $definition ) ] = $this->build_panel_tile( $definition );
			}
		}

		return $settings;
	}

	/**
	 * Archived definitions stay registered, so existing copies keep their panel and locks; the flag
	 * only hides them from new drops.
	 */
	private function get_editor_definitions(): array {
		$keys = array_flip( array_merge( self::EDITOR_DEFINITION_KEYS, [ Widgets_Definitions_Registry::ARCHIVED_KEY ] ) );

		return array_map(
			fn ( array $definition ) => array_intersect_key( $definition, $keys ),
			$this->get_registry()->all()
		);
	}

	private function can_insert( array $definition ): bool {
		if ( Widget_Definition::SOURCE_SITE !== $definition['source'] ) {
			return true;
		}

		return empty( $definition[ Widgets_Definitions_Registry::ARCHIVED_KEY ] ) && Site_Widgets_Access_Controller::can_add_to_page();
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
