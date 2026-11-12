<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\MCP\Composer\Admin\McpSettingsController;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Kit_Settings_Host;
use Elementor\Modules\Mcp\Events\Pro_Feature_Suggestion_Tracker;
use Elementor\Modules\Mcp\Site_Flag;
use Elementor\Modules\Mcp\Utils\Editor_Sync_State;
use Elementor\Modules\Mcp\Utils\Mcp_V4_Gate;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Abstract_Ability {

	const KIND_TOOL = 'tool';
	const KIND_RESOURCE = 'resource';
	const ABILITY_ID_PREFIX = 'elementor/';
	const DRY_RUN_PARAM = 'dry_run';

	private ?Ability_Definition $cached_definition = null;

	abstract protected function get_ability_id(): string;

	abstract protected function get_definition(): Ability_Definition;

	abstract public function execute( $input = [] );

	final public function execute_guarded( $input = [] ) {
		if ( ! is_array( $input ) ) {
			$input = is_object( $input ) ? (array) $input : [];
		}

		$availability = $this->is_available();
		if ( is_wp_error( $availability ) ) {
			return $availability;
		}

		$is_dry_run = self::is_dry_run( $input );
		if ( $is_dry_run && ! $this->supports_dry_run() ) {
			return new \WP_Error(
				'dry_run_unsupported',
				__( 'This ability does not support dry run.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$is_mutating = self::KIND_TOOL === $this->get_kind() && $this->is_page_mutating();

		if ( $is_mutating ) {
			$guard = apply_filters( 'elementor/mcp/pre_execute_guard', null, $input );
			if ( is_wp_error( $guard ) ) {
				return $guard;
			}
		}

		Pro_Feature_Suggestion_Tracker::reset();

		if ( $is_mutating ) {
			Editor_Sync_State::begin_mcp_write();
		}

		try {
			$result = $this->execute( $input );
		} finally {
			if ( $is_mutating ) {
				Editor_Sync_State::end_mcp_write();
			}
		}

		$post_id = isset( $input['post_id'] ) ? (int) $input['post_id'] : 0;

		Pro_Feature_Suggestion_Tracker::flush( $this->get_id(), $result );
		Kit_Settings_Host::discard_pending();

		$is_failed = is_wp_error( $result ) || ( is_array( $result ) && 'error' === ( $result['status'] ?? '' ) );

		if ( $is_mutating && $post_id > 0 && ! $is_failed && ! $is_dry_run ) {
			Editor_Sync_State::set_mcp_mutation( $post_id );
		}

		$record_input = is_array( $input ) ? $input : [];
		if ( $this->should_record_site_capability( $record_input, $result ) ) {
			$capability = Site_Flag::capability_for_ability( $this->get_id() );
			if ( $capability ) {
				Site_Flag::mark( $capability );
			}
		}

		return $result;
	}

	/**
	 * Validates input against the ability's input schema, the same way the WordPress Abilities API does.
	 *
	 * @return true|\WP_Error
	 */
	public function validate_input_against_schema( $input ) {
		return rest_validate_value_from_schema( $input, $this->definition()->to_array()['input_schema'], 'input' );
	}

	public function check_permission(): bool {
		return (bool) call_user_func( $this->definition()->permission_callback );
	}

	public function register(): void {
		$definition = $this->definition()->to_array();
		$definition['execute_callback'] = [ $this, 'execute_guarded' ];
		$definition['description'] = $this->get_description_for_llm();

		$meta = is_array( $definition['meta'] ?? null ) ? $definition['meta'] : [];
		$mcp = is_array( $meta['mcp'] ?? null ) ? $meta['mcp'] : [];
		$mcp['public'] = McpSettingsController::is_enabled();
		if ( isset( $mcp['description'] ) ) {
			$mcp['description'] = $this->maybe_append_unavailable_notice( (string) $mcp['description'] );
		}
		$meta['mcp'] = $mcp;
		$meta['show_in_rest'] = true;
		$definition['meta'] = $meta;
		wp_register_ability( $this->get_id(), $definition );
	}

	public function get_id(): string {
		return $this->get_ability_id();
	}

	public function get_kind(): string {
		return $this->is_resource() ? self::KIND_RESOURCE : self::KIND_TOOL;
	}

	public function get_uri(): ?string {
		return $this->mcp_meta()['uri'] ?? null;
	}

	public function get_mime_type(): ?string {
		return $this->mcp_meta()['mimeType'] ?? null;
	}

	public function get_resource_description(): ?string {
		$base = $this->mcp_meta()['description'] ?? $this->definition()->description;

		return $this->maybe_append_unavailable_notice( (string) $base );
	}

	public function get_description_for_llm(): string {
		return $this->maybe_append_unavailable_notice( (string) $this->definition()->description );
	}

	public function get_display_name(): string {
		return (string) ( $this->mcp_meta()['name'] ?? $this->definition()->label );
	}

	public function get_proxy_slug(): string {
		if ( self::KIND_RESOURCE === $this->get_kind() ) {
			return (string) $this->get_uri();
		}

		return substr( $this->get_id(), strlen( self::ABILITY_ID_PREFIX ) );
	}

	/**
	 * Whether this ability may currently run.
	 *
	 * Subclasses may override to add reasons beyond the default Atomic Editor gate
	 * (missing plugin, licence tier, post-type support, ...). Return `true`
	 * when available, or a `\WP_Error` explaining why not. Include a
	 * `description_notice` entry in the error data to add a short hint to
	 * this ability's description in `tools/list` / `elementor/list-resources`.
	 *
	 * @return true|\WP_Error
	 */
	public function is_available() {
		return Mcp_V4_Gate::is_available( $this->get_id() );
	}

	public function is_exposed_via_proxy(): bool {
		return true;
	}

	public function is_exposed_on_server(): bool {
		return true;
	}

	/**
	 * Whether the ability accepts `dry_run: true`. A dry run validates the input and returns
	 * the exact result a real run would produce, without writing anything, so the editor can apply it locally.
	 */
	public function supports_dry_run(): bool {
		return false;
	}

	public static function is_dry_run( $input ): bool {
		return is_array( $input ) && ! empty( $input[ self::DRY_RUN_PARAM ] );
	}

	protected function should_record_site_capability( $input, $result ): bool {
		if ( null === Site_Flag::capability_for_ability( $this->get_id() ) ) {
			return false;
		}

		if ( self::is_dry_run( $input ) ) {
			return false;
		}

		if ( is_wp_error( $result ) ) {
			return false;
		}

		if ( is_array( $result ) && 'error' === ( $result['status'] ?? '' ) ) {
			return false;
		}

		return true;
	}

	private function is_resource(): bool {
		return self::KIND_RESOURCE === ( $this->mcp_meta()['type'] ?? null );
	}

	private function is_page_mutating(): bool {
		return true === ( $this->definition()->meta['mutates_page'] ?? false );
	}

	protected function definition(): Ability_Definition {
		if ( null === $this->cached_definition ) {
			$this->cached_definition = $this->get_definition();

			if ( $this->supports_dry_run() ) {
				$this->add_dry_run_input( $this->cached_definition );
			}
		}

		return $this->cached_definition;
	}

	private function add_dry_run_input( Ability_Definition $definition ): void {
		if ( isset( $definition->input_schema['properties'][ self::DRY_RUN_PARAM ] ) ) {
			return;
		}

		$definition->input_schema['type'] = $definition->input_schema['type'] ?? 'object';
		$definition->input_schema['properties'][ self::DRY_RUN_PARAM ] = [
			'type' => 'boolean',
			'default' => false,
			'description' => 'Validate and return the planned result without writing anything.',
		];
	}

	private function mcp_meta(): array {
		$meta = $this->definition()->meta;

		return is_array( $meta['mcp'] ?? null ) ? $meta['mcp'] : [];
	}

	private function maybe_append_unavailable_notice( string $description ): string {
		$availability = $this->is_available();
		if ( ! is_wp_error( $availability ) ) {
			return $description;
		}

		$data = $availability->get_error_data();
		$notice = is_array( $data ) && isset( $data['description_notice'] )
			? (string) $data['description_notice']
			: $availability->get_error_message();

		if ( '' === $notice ) {
			return $description;
		}

		return '' === $description ? $notice : rtrim( $description ) . ' ' . $notice;
	}
}
