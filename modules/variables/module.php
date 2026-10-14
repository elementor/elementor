<?php

namespace Elementor\Modules\Variables;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\Variables\Classes\Variable_Types_Registry;
use Elementor\Modules\Variables\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Constants;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	const MODULE_NAME = 'e-variables';
	const EXPERIMENT_NAME = AtomicWidgetsModule::EXPERIMENT_NAME;

	private Variable_Types_Registry $variable_types_registry;

	public function get_name() {
		return self::MODULE_NAME;
	}

	private function hooks() {
		return new Hooks();
	}

	public function __construct() {
		parent::__construct();

		if ( ! $this->is_experiment_active() ) {
			return;
		}

		$this->hooks()->register();

		( new Import_Export_Customization() )->register_hooks();

		add_action( 'init', [ $this, 'init_variable_types_registry' ] );
		add_filter( 'elementor/kit/meta_to_preserve_on_kit_import', [ $this, 'add_meta_to_preserve_on_kit_import' ] );
		add_action( 'elementor/editor/before_enqueue_scripts', fn () => $this->enqueue_editor_scripts() );
	}

	private function is_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME );
	}

	public function init_variable_types_registry(): void {
		$this->variable_types_registry = new Variable_Types_Registry();

		do_action( 'elementor/variables/register', $this->variable_types_registry );
	}


	public function get_variable_types_registry(): Variable_Types_Registry {
		return $this->variable_types_registry;
	}

	private function get_quota_config(): array {
		return [
			Color_Variable_Prop_Type::get_key() => 100000,
			Font_Variable_Prop_Type::get_key() => 100000,
		];
	}

	public function enqueue_editor_scripts() {

		wp_add_inline_script(
			'elementor-common',
			'window.ElementorVariablesQuotaConfig = ' . wp_json_encode( $this->get_quota_config() ) . ';',
			'before'
		);
	}

	public function add_meta_to_preserve_on_kit_import( array $meta_keys ): array {
		return array_merge( $meta_keys, [
			Constants::VARIABLES_META_KEY,
		] );
	}
}
