<?php

namespace Elementor\Modules\Mcp\Abilities;

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

	public function check_permission(): bool {
		return (bool) call_user_func( $this->definition()->permission_callback );
	}

	public function register(): void {
		$definition = $this->definition()->to_array();
		$definition['execute_callback'] = [ $this, 'execute' ];
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
		return $this->mcp_meta()['description'] ?? null;
	}

	public function get_display_name(): string {
		return $this->definition()->label;
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
