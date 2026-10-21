<?php

namespace Elementor\Modules\Agents\Components\Webmcp;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Feature_Component;
use Elementor\Modules\Agents\Components\Webmcp\Tools\Abstract_Webmcp_Tool;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webmcp_Browser_Tools extends Feature_Component {

	const SCRIPT_HANDLE = 'e-agents-webmcp-tools';

	const SCRIPT_FILE = 'agents-webmcp-tools';

	const CONFIG_OBJECT_NAME = 'elementorAgentsWebmcpConfig';

	const RELEVANT_TOOLS_TRANSIENT = 'elementor_agents_webmcp_relevant_tools';

	const RELEVANT_TOOLS_TTL = HOUR_IN_SECONDS;

	private Agent_Ready_Settings $settings;

	private Business_Info_Extractor $business_info_extractor;

	/** @var Abstract_Webmcp_Tool[] Keyed by ability name. */
	private array $core_tools = [];

	/**
	 * @param Agent_Ready_Settings    $settings
	 * @param Business_Info_Extractor $business_info_extractor
	 * @param Abstract_Webmcp_Tool[]  $core_tools
	 */
	public function __construct( Agent_Ready_Settings $settings, Business_Info_Extractor $business_info_extractor, array $core_tools ) {
		$this->settings                = $settings;
		$this->business_info_extractor = $business_info_extractor;

		foreach ( $core_tools as $tool ) {
			$this->core_tools[ $tool->get_ability_name() ] = $tool;
		}
	}

	public function get_id(): string {
		return 'webmcp_browser_tools';
	}

	public function get_layer(): string {
		return 'mcp';
	}

	public static function is_available(): bool {
		return function_exists( 'wp_get_abilities' ) && function_exists( 'wp_register_ability_category' );
	}

	public function is_enabled(): bool {
		return parent::is_enabled() && self::is_available();
	}

	public function register(): void {
		add_action( 'wp_abilities_api_categories_init', [ $this, 'register_category' ] );
		add_action( 'update_option_' . Agent_Ready_Settings::OPTION, [ $this, 'flush_relevant_tools_cache' ] );
		add_action( 'update_option_' . Agent_Ready_Settings::OPTION, [ $this, 'warm_business_info_on_save' ] );
		add_action( 'elementor/agents/llms_txt/cache_invalidated', [ $this, 'flush_relevant_tools_cache' ] );

		if ( ! $this->settings->is_browser_tools_enabled() ) {
			return;
		}

		add_action( 'admin_init', [ $this, 'warm_business_info' ] );
		add_action( 'wp_abilities_api_init', [ $this, 'register_core_abilities' ] );
		add_filter( 'elementor/agents/webmcp/is_applicable', '__return_true' );
		add_filter( 'elementor/agents/webmcp_manifest', [ $this, 'add_manifest_tools' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_frontend_script' ] );

		( new Webmcp_Run_Route( $this ) )->register();
		$this->business_info_extractor->register();
	}

	public function register_category(): void {
		wp_register_ability_category(
			Abstract_Webmcp_Tool::CATEGORY,
			[
				'label' => __( 'Elementor Agents', 'elementor' ),
				'description' => __( 'Read-only tools that AI agents can use while browsing this site.', 'elementor' ),
			]
		);
	}

	public function register_core_abilities(): void {
		foreach ( $this->core_tools as $tool ) {
			$tool->register();
		}
	}

	/**
	 * @return \WP_Ability[]
	 */
	public function get_tools(): array {
		if ( ! self::is_available() ) {
			return [];
		}

		return array_values( array_filter(
			wp_get_abilities( [ 'category' => Abstract_Webmcp_Tool::CATEGORY ] ),
			fn( $ability ) => $ability instanceof \WP_Ability && isset( $this->core_tools[ $ability->get_name() ] )
		) );
	}

	/**
	 * @return array<string, \WP_Ability> Keyed by browser tool name.
	 */
	public function get_relevant_tools(): array {
		$tools = [];

		foreach ( $this->get_tools() as $ability ) {
			if ( $this->is_tool_relevant( $ability ) ) {
				$tools[ self::to_tool_name( $ability->get_name() ) ] = $ability;
			}
		}

		return $tools;
	}

	public function is_tool_relevant( \WP_Ability $ability ): bool {
		$core_tool = $this->core_tools[ $ability->get_name() ] ?? null;

		return $core_tool && $core_tool->is_relevant() && $this->is_filter_relevant( $ability->get_name() );
	}

	public static function to_tool_name( string $ability_name ): string {
		$prefix = Abstract_Webmcp_Tool::CATEGORY . '/';

		if ( 0 === strpos( $ability_name, $prefix ) ) {
			$ability_name = substr( $ability_name, strlen( $prefix ) );
		}

		return (string) preg_replace( '/[^a-z0-9]+/', '_', $ability_name );
	}

	public function get_tool_descriptors(): array {
		return $this->to_descriptors( $this->get_relevant_tools() );
	}

	public function get_cached_tool_descriptors(): array {
		return $this->to_descriptors( $this->get_cached_relevant_tools() );
	}

	/**
	 * Relevance checks are cached because they run on every front-end view and every public tool call.
	 * Only tool names are cached, so descriptions stay in the request locale.
	 *
	 * @return array<string, \WP_Ability> Keyed by browser tool name.
	 */
	public function get_cached_relevant_tools(): array {
		$cached_names = get_transient( self::RELEVANT_TOOLS_TRANSIENT );

		if ( ! is_array( $cached_names ) ) {
			$cached_names = array_keys( $this->get_relevant_tools() );

			set_transient( self::RELEVANT_TOOLS_TRANSIENT, $cached_names, self::RELEVANT_TOOLS_TTL );
		}

		$tools = [];

		foreach ( $this->get_tools() as $ability ) {
			$name = self::to_tool_name( $ability->get_name() );

			if ( in_array( $name, $cached_names, true ) ) {
				$tools[ $name ] = $ability;
			}
		}

		return $tools;
	}

	public function flush_relevant_tools_cache(): void {
		delete_transient( self::RELEVANT_TOOLS_TRANSIENT );
	}

	public function warm_business_info(): void {
		if ( wp_doing_ajax() || wp_doing_cron() || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$this->business_info_extractor->warm();
	}

	public function warm_business_info_on_save(): void {
		if ( $this->settings->is_browser_tools_enabled() ) {
			$this->business_info_extractor->warm();
		}
	}

	/**
	 * @param array<string, \WP_Ability> $tools Keyed by browser tool name.
	 */
	private function to_descriptors( array $tools ): array {
		$descriptors = [];

		foreach ( $tools as $name => $ability ) {
			$descriptors[] = [
				'name' => $name,
				'description' => $ability->get_description(),
				'inputSchema' => $this->get_descriptor_schema( $ability ),
			];
		}

		return $descriptors;
	}

	public function get_admin_tools(): array {
		if ( ! self::is_available() ) {
			return [];
		}

		$tools = [];

		foreach ( $this->core_tools as $ability_name => $tool ) {
			$tools[] = [
				'name' => self::to_tool_name( $ability_name ),
				'label' => $tool->get_label(),
				'description' => $tool->get_admin_description(),
			];
		}

		return $tools;
	}

	public function add_manifest_tools( $manifest ): array {
		$manifest = (array) $manifest;

		$manifest['tools'] = array_merge( (array) ( $manifest['tools'] ?? [] ), $this->get_tool_descriptors() );

		return $manifest;
	}

	public function enqueue_frontend_script(): void {
		if ( Plugin::$instance->preview->is_preview_mode() ) {
			return;
		}

		$tools = $this->get_cached_tool_descriptors();

		if ( empty( $tools ) ) {
			return;
		}

		$min_suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min';

		wp_enqueue_script(
			self::SCRIPT_HANDLE,
			ELEMENTOR_ASSETS_URL . 'js/' . self::SCRIPT_FILE . $min_suffix . '.js',
			[],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script(
			self::SCRIPT_HANDLE,
			self::CONFIG_OBJECT_NAME,
			[
				'runUrl' => rest_url( Webmcp_Run_Route::ROUTE ),
				'tools' => $tools,
			]
		);
	}

	private function is_filter_relevant( string $ability_name ): bool {
		/**
		 * Filters whether a built-in WebMCP tool is relevant for this site right now.
		 * Irrelevant tools are not exposed to agents and are reported as irrelevant to the admin.
		 * Only Elementor's own tools are exposed, so this filter can hide tools but not add them.
		 *
		 * @param bool   $relevant     Whether the tool is relevant.
		 * @param string $ability_name Ability name, e.g. `elementor-webmcp/search-site-content`.
		 */
		return (bool) apply_filters( 'elementor/agents/webmcp/is_tool_relevant', true, $ability_name );
	}

	private function get_descriptor_schema( \WP_Ability $ability ): array {
		$schema = $ability->get_input_schema();

		if ( ! empty( $schema ) ) {
			return $schema;
		}

		return [
			'type' => 'object',
			'properties' => (object) [],
		];
	}
}
