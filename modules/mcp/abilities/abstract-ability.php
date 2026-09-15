<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Utils\Editor_Sync_State;
use Elementor\Modules\Mcp\Utils\Mcp_V4_Gate;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Abstract_Ability {

	const KIND_TOOL = 'tool';
	const KIND_RESOURCE = 'resource';
	const ABILITY_ID_PREFIX = 'elementor/';

	private ?Ability_Definition $cached_definition = null;

	abstract protected function get_ability_id(): string;

	abstract protected function get_definition(): Ability_Definition;

	abstract public function execute( $input = [] );

	final public function execute_guarded( $input = [] ) {
		$availability = $this->is_available();
		if ( is_wp_error( $availability ) ) {
			return $availability;
		}

		$is_mutating = self::KIND_TOOL === $this->get_kind() && $this->is_destructive();

		if ( $is_mutating ) {
			$guard = apply_filters( 'elementor/mcp/pre_execute_guard', null, $input );
			if ( is_wp_error( $guard ) ) {
				return $guard;
			}
		}

		$result  = $this->execute( $input );
		$post_id = isset( $input['post_id'] ) ? (int) $input['post_id'] : 0;

		$is_failed = is_wp_error( $result ) || ( is_array( $result ) && 'error' === ( $result['status'] ?? '' ) );

		if ( $is_mutating && $post_id > 0 && ! $is_failed ) {
			Editor_Sync_State::set_mcp_mutation( $post_id );
		}

		return $result;
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
		$mcp['public'] = true;
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

	private function is_resource(): bool {
		return self::KIND_RESOURCE === ( $this->mcp_meta()['type'] ?? null );
	}

	private function is_destructive(): bool {
		return false !== ( $this->definition()->meta['annotations']['destructive'] ?? true );
	}

	protected function definition(): Ability_Definition {
		if ( null === $this->cached_definition ) {
			$this->cached_definition = $this->get_definition();
		}

		return $this->cached_definition;
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
