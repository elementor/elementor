<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\DynamicTags\Manager as Dynamic_Tags_Manager;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Render_Context;
use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;
use Elementor\Modules\DataFlow\Snippets\Snippet_Access;
use Elementor\Modules\DataFlow\Snippets\Snippet_Store;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'e_data_flow';
	const HANDLE_FRONTEND = 'elementor-data-flow';
	const HANDLE_EDITOR_PREVIEW = 'elementor-data-flow-editor-preview';
	const HANDLE_SNIPPET_PREFIX = 'elementor-data-flow-snippet-';
	const SCRIPT_ID_DATA = 'elementor-data-flow-data';
	const EDITOR_SETTINGS_KEY = 'dataFlow';

	private array $collected_snippet_references = [];

	private ?array $page_state = null;

	private ?State_Scopes $scopes = null;

	private array $element_frames = [];

	private array $component_params = [];

	public function get_name() {
		return 'data-flow';
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Data Flow (POC)', 'elementor' ),
			'description' => esc_html__( 'Typed element state, state bindings and MCP-authored interaction snippets.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public static function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public function __construct() {
		parent::__construct();

		if ( ! self::is_active() ) {
			return;
		}

		add_action( 'init', [ Snippet_Store::class, 'register_post_type' ] );
		add_action( 'elementor/documents/register_controls', [ Page_State::class, 'register_controls' ] );
		add_filter( 'elementor/document/save/data', [ $this, 'strip_snippet_references_for_untrusted_users' ] );
		add_action( 'elementor/frontend/after_register_scripts', fn() => $this->register_frontend_scripts() );
		add_filter( 'elementor/editor/localize_settings', [ $this, 'add_editor_settings' ] );
		add_action( 'elementor/preview/enqueue_scripts', fn() => $this->enqueue_editor_preview_scripts() );
		add_action( 'elementor/frontend/before_render', [ $this, 'enter_element' ] );
		add_action( 'elementor/frontend/after_render', [ $this, 'leave_element' ] );
		add_action( 'elementor/dynamic_tags/register', [ $this, 'register_state_tag' ] );
		add_filter( 'body_class', [ $this, 'add_page_state_classes' ] );
		add_action( 'wp_head', [ $this, 'print_page_state_variables' ] );
		add_action( 'wp_footer', [ $this, 'print_data' ], 1 );
	}

	public function add_editor_settings( $settings ) {
		$settings[ self::EDITOR_SETTINGS_KEY ] = [
			'componentParams' => (object) Component_State_Params::get_all_params(),
			'snippets' => (object) $this->get_editor_snippets(),
			'snippetFiles' => (object) $this->get_editor_snippet_files(),
		];

		return $settings;
	}

	public function enter_element( Element_Base $element ) {
		if ( $this->is_editor_context() ) {
			return;
		}

		$data = $element->get_data();

		$this->collect_snippet_references( $element, $data );

		$scope_tag = $this->get_scopes()->enter( $element->get_id(), $data, $this->get_component_params( $element ) );
		$has_bindings = $this->uses_state_tag( $data );

		$this->element_frames[] = [ 'scope_tag' => $scope_tag, 'has_bindings' => $has_bindings ];

		Render_Context::push( State_Tag::RENDER_CONTEXT_KEY, [
			'state' => $this->get_scopes()->merged_state(),
			'scopes' => array_merge(
				[ State_Tag::PAGE_SCOPE => $this->get_page_state() ],
				$this->get_scopes()->active_states()
			),
		] );

		if ( $has_bindings ) {
			Binding_Collector::begin();
		}

		if ( null !== $scope_tag || $has_bindings ) {
			ob_start();
		}
	}

	public function leave_element() {
		if ( $this->is_editor_context() ) {
			return;
		}

		$frame = array_pop( $this->element_frames );
		$this->get_scopes()->leave();

		Render_Context::pop( State_Tag::RENDER_CONTEXT_KEY );

		if ( null === $frame['scope_tag'] && ! $frame['has_bindings'] ) {
			return;
		}

		$html = ob_get_clean();

		if ( $frame['has_bindings'] ) {
			$html = Binding_Locator::locate( $html, Binding_Collector::end() );
		}

		if ( null !== $frame['scope_tag'] ) {
			$scope = $this->get_scopes()->get_scope( $frame['scope_tag'] );

			$html = State_Scopes::tag_root_element(
				$html,
				$frame['scope_tag'],
				State_CSS::classes( $scope['state'] ),
				State_CSS::variables( $scope['state'], $scope['schema'] )
			);
		}

		// PHPCS - The element output was escaped when it was rendered; only data attributes are added, escaped.
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	public function register_state_tag( Dynamic_Tags_Manager $dynamic_tags ) {
		$dynamic_tags->register_group( State_Tag::GROUP, [ 'title' => esc_html__( 'Element state', 'elementor' ) ] );
		$dynamic_tags->register( new State_Tag() );
		$dynamic_tags->register( new State_Image_Tag() );
	}

	public function strip_snippet_references_for_untrusted_users( $data ) {
		if ( Snippet_Access::can_manage() || empty( $data['elements'] ) || ! is_array( $data['elements'] ) ) {
			return $data;
		}

		$data['elements'] = Snippet_References::strip( $data['elements'] );

		return $data;
	}

	public function add_page_state_classes( $classes ) {
		return array_merge( (array) $classes, State_CSS::classes( $this->get_page_state() ) );
	}

	public function print_page_state_variables() {
		$variables = State_CSS::variables( $this->get_page_state(), [] );

		if ( empty( $variables ) ) {
			return;
		}

		// PHPCS - Values are validated by State_CSS against strict patterns, so they can't break out of the style tag.
		echo '<style id="elementor-data-flow-vars">body{' . State_CSS::declarations( $variables ) . '}</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	public function print_data() {
		if ( $this->is_editor_context() ) {
			return;
		}

		$state = $this->get_page_state();
		$scopes = $this->get_scopes()->get_scopes();

		if ( empty( $state ) && empty( $this->collected_snippet_references ) && empty( $scopes ) ) {
			return;
		}

		wp_enqueue_script( self::HANDLE_FRONTEND );
		$this->enqueue_used_snippets();

		$json = wp_json_encode( [
			'state' => (object) $state,
			'schema' => (object) State_Schema::describe_values( $state ),
			'scopes' => array_map( fn( $scope ) => array_merge( $scope, [ 'state' => (object) $scope['state'], 'schema' => (object) $scope['schema'] ] ), $scopes ),
			'snippets' => array_values( $this->collected_snippet_references ),
		], JSON_HEX_TAG | JSON_HEX_AMP );

		// PHPCS - JSON is encoded with JSON_HEX_TAG so it can't break out of the script tag.
		echo '<script type="application/json" id="' . esc_attr( self::SCRIPT_ID_DATA ) . '">' . $json . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	private function collect_snippet_references( Element_Base $element, array $data ): void {
		$references = Snippet_References::sanitize( $data[ Snippet_References::DATA_KEY ] ?? [] );

		if ( empty( $references ) ) {
			return;
		}

		$interaction_id = $data['origin_id'] ?? $element->get_id();

		$this->collected_snippet_references[ $interaction_id ] = [
			'elementId' => $interaction_id,
			'snippets' => $references,
		];
	}

	private function enqueue_used_snippets(): void {
		$names = array_unique( array_merge( ...array_map(
			fn( $entry ) => array_column( $entry['snippets'], 'snippet' ),
			array_values( $this->collected_snippet_references )
		) ) );

		foreach ( $names as $name ) {
			$snippet = Snippet_Store::get( $name );

			if ( ! $snippet || '' === $snippet['url'] ) {
				continue;
			}

			wp_enqueue_script( self::HANDLE_SNIPPET_PREFIX . $name, $snippet['url'], [ self::HANDLE_FRONTEND ], $snippet['version'], true );
		}
	}

	private function get_editor_snippet_files(): array {
		$files = [];

		foreach ( Snippet_Store::all() as $snippet ) {
			if ( '' !== $snippet['url'] ) {
				$files[ $snippet['name'] ] = add_query_arg( 'ver', $snippet['version'], $snippet['url'] );
			}
		}

		return $files;
	}

	private function get_editor_snippets(): array {
		$can_view_code = Snippet_Access::can_view_code();
		$snippets = [];

		foreach ( Snippet_Store::all() as $snippet ) {
			$snippets[ $snippet['name'] ] = array_map(
				fn( $handler ) => $can_view_code ? $handler : array_diff_key( $handler, [ 'code' => true ] ),
				$snippet['handlers']
			);
		}

		return $snippets;
	}

	private function uses_state_tag( array $data ): bool {
		return ! empty( $data['settings'] ) && false !== strpos( wp_json_encode( $data['settings'] ), '"name":"' . State_Tag::NAME );
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
