<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Element_Base;
use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'e_data_flow';
	const HANDLE_FRONTEND = 'elementor-data-flow';
	const HANDLE_EDITOR_PREVIEW = 'elementor-data-flow-editor-preview';
	const SCRIPT_ID_DATA = 'elementor-data-flow-data';
	const EDITOR_SETTINGS_KEY = 'dataFlow';

	private array $collected_handlers = [];

	private ?array $page_state = null;

	private array $rendered_bindings = [];

	private ?State_Scopes $scopes = null;

	private array $scope_tags = [];

	private array $component_params = [];

	public function get_name() {
		return 'data-flow';
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Data Flow (POC)', 'elementor' ),
			'description' => esc_html__( 'Page state, element handlers and {{state.key}} text bindings.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public static function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public static function can_current_user_save_handlers(): bool {
		return current_user_can( 'unfiltered_html' );
	}

	public function __construct() {
		parent::__construct();

		if ( ! self::is_active() ) {
			return;
		}

		add_action( 'elementor/documents/register_controls', [ Page_State::class, 'register_controls' ] );
		add_filter( 'elementor/document/save/data', [ $this, 'strip_handlers_for_untrusted_users' ] );
		add_action( 'elementor/frontend/after_register_scripts', fn() => $this->register_frontend_scripts() );
		add_filter( 'elementor/editor/localize_settings', [ $this, 'add_editor_settings' ] );
		add_action( 'elementor/preview/enqueue_scripts', fn() => $this->enqueue_editor_preview_scripts() );
		add_action( 'elementor/frontend/before_render', [ $this, 'enter_element' ] );
		add_action( 'elementor/frontend/after_render', [ $this, 'leave_element' ] );
		add_filter( 'elementor/widget/render_content', [ $this, 'render_widget_bindings' ] );
		add_filter( 'elementor/frontend/the_content', [ $this, 'render_state_bindings' ] );
		add_action( 'wp_footer', [ $this, 'print_data' ], 1 );
	}

	public function add_editor_settings( $settings ) {
		$settings[ self::EDITOR_SETTINGS_KEY ] = [
			'componentParams' => (object) Component_State_Params::get_all_params(),
		];

		return $settings;
	}

	public function enter_element( Element_Base $element ) {
		if ( $this->is_editor_context() ) {
			return;
		}

		$data = $element->get_data();

		$this->collect_element_handlers( $element, $data );

		$scope_tag = $this->get_scopes()->enter( $element->get_id(), $data, $this->get_component_params( $element ) );
		$this->scope_tags[] = $scope_tag;

		if ( null !== $scope_tag ) {
			ob_start();
		}
	}

	public function leave_element() {
		if ( $this->is_editor_context() ) {
			return;
		}

		$scope_tag = array_pop( $this->scope_tags );
		$this->get_scopes()->leave();

		if ( null === $scope_tag ) {
			return;
		}

		// PHPCS - The element output was escaped when it was rendered; only the scope attribute is added, escaped.
		echo State_Scopes::tag_root_element( ob_get_clean(), $scope_tag ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	public function render_widget_bindings( $content ) {
		if ( $this->is_editor_context() || ! is_string( $content ) || ! State_Renderer::has_bindings( $content ) ) {
			return $content;
		}

		$rendered = State_Renderer::render( $content, $this->get_scopes()->merged_state() );

		$this->rendered_bindings = array_merge( $this->rendered_bindings, $rendered['bindings'] );

		return $rendered['html'];
	}

	public function render_state_bindings( $content ) {
		if ( $this->is_editor_context() || ! is_string( $content ) || ! State_Renderer::has_bindings( $content ) ) {
			return $content;
		}

		$rendered = State_Renderer::render( $content, $this->get_page_state() );

		$this->rendered_bindings = array_merge( $this->rendered_bindings, $rendered['bindings'] );

		return $rendered['html'];
	}

	public function strip_handlers_for_untrusted_users( $data ) {
		if ( self::can_current_user_save_handlers() || empty( $data['elements'] ) || ! is_array( $data['elements'] ) ) {
			return $data;
		}

		$data['elements'] = Handlers_Parser::strip( $data['elements'] );

		return $data;
	}

	public function print_data() {
		if ( $this->is_editor_context() ) {
			return;
		}

		$state = $this->get_page_state();
		$scopes = $this->get_scopes()->get_scopes();

		if ( empty( $state ) && empty( $this->collected_handlers ) && empty( $scopes ) ) {
			return;
		}

		wp_enqueue_script( self::HANDLE_FRONTEND );

		$json = wp_json_encode( [
			'state' => (object) $state,
			'scopes' => array_map( fn( $scope ) => array_merge( $scope, [ 'state' => (object) $scope['state'] ] ), $scopes ),
			'handlers' => array_values( $this->collected_handlers ),
			'bindings' => $this->rendered_bindings,
		], JSON_HEX_TAG | JSON_HEX_AMP );

		// PHPCS - JSON is encoded with JSON_HEX_TAG so it can't break out of the script tag.
		echo '<script type="application/json" id="' . esc_attr( self::SCRIPT_ID_DATA ) . '">' . $json . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	private function collect_element_handlers( Element_Base $element, array $data ): void {
		$handlers = Handlers_Parser::sanitize( $data[ Handlers_Parser::DATA_KEY ] ?? [] );

		if ( empty( $handlers ) ) {
			return;
		}

		$interaction_id = $data['origin_id'] ?? $element->get_id();

		$this->collected_handlers[ $interaction_id ] = [
			'elementId' => $interaction_id,
			'handlers' => $handlers,
		];
	}

	private function get_scopes(): State_Scopes {
		if ( null === $this->scopes ) {
			$this->scopes = new State_Scopes( $this->get_page_state() );
		}

		return $this->scopes;
	}

	private function get_component_params( Element_Base $element ): ?array {
		if ( Component_Instance_Prop_Type::WIDGET_TYPE !== $element->get_name() ) {
			return null;
		}

		$component_id = Component_Instance_Prop_Type::extract_component_id( $element->get_settings() );

		if ( null === $component_id ) {
			return [];
		}

		if ( ! isset( $this->component_params[ $component_id ] ) ) {
			$this->component_params[ $component_id ] = Component_State_Params::get( (int) $component_id, is_preview() )['params'];
		}

		return $this->component_params[ $component_id ];
	}

	private function get_page_state(): array {
		if ( null === $this->page_state ) {
			$this->page_state = $this->resolve_page_state();
		}

		return $this->page_state;
	}

	private function resolve_page_state(): array {
		if ( ! is_singular() ) {
			return [];
		}

		$document = Plugin::$instance->documents->get( get_queried_object_id() );

		if ( ! $document || ! $document->is_built_with_elementor() ) {
			return [];
		}

		return Page_State::resolve( $document );
	}

	private function is_editor_context(): bool {
		return Plugin::$instance->editor->is_edit_mode() || Plugin::$instance->preview->is_preview_mode();
	}

	private function register_frontend_scripts() {
		wp_register_script(
			self::HANDLE_FRONTEND,
			$this->get_js_assets_url( 'data-flow' ),
			[],
			ELEMENTOR_VERSION,
			true
		);
	}

	private function enqueue_editor_preview_scripts() {
		wp_enqueue_script(
			self::HANDLE_EDITOR_PREVIEW,
			$this->get_js_assets_url( 'data-flow-editor-preview' ),
			[],
			ELEMENTOR_VERSION,
			true
		);
	}
}
