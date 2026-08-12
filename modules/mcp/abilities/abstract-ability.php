<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Utils\Editor_Sync_State;

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

	final public function register(): void {
		$definition = $this->definition()->to_array();
		$definition['execute_callback'] = [ $this, 'execute_guarded' ];
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
		return $this->mcp_meta()['description'] ?? $this->definition()->description;
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
}
