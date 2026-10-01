<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'e_data_flow';
	const HANDLE_FRONTEND = 'elementor-data-flow';
	const SCRIPT_ID_DATA = 'elementor-data-flow-data';

	private array $collected_handlers = [];

	private ?array $page_state = null;

	private array $rendered_bindings = [];

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
		add_filter( 'elementor/frontend/builder_content_data', [ $this, 'collect_document_handlers' ] );
		add_filter( 'elementor/frontend/the_content', [ $this, 'render_state_bindings' ] );
		add_action( 'wp_footer', [ $this, 'print_data' ], 1 );
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

	public function collect_document_handlers( $elements_data ) {
		if ( $this->is_editor_context() || ! is_array( $elements_data ) ) {
			return $elements_data;
		}

		$this->collected_handlers = array_merge( $this->collected_handlers, Handlers_Parser::collect( $elements_data ) );

		return $elements_data;
	}

	public function print_data() {
		if ( $this->is_editor_context() ) {
			return;
		}

		$state = $this->get_page_state();

		if ( empty( $state ) && empty( $this->collected_handlers ) ) {
			return;
		}

		wp_enqueue_script( self::HANDLE_FRONTEND );

		$json = wp_json_encode( [
			'state' => (object) $state,
			'handlers' => $this->collected_handlers,
			'bindings' => $this->rendered_bindings,
		], JSON_HEX_TAG | JSON_HEX_AMP );

		// PHPCS - JSON is encoded with JSON_HEX_TAG so it can't break out of the script tag.
		echo '<script type="application/json" id="' . esc_attr( self::SCRIPT_ID_DATA ) . '">' . $json . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
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
}
