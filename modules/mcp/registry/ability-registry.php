<?php

namespace Elementor\Modules\Mcp\Registry;

use Elementor\Modules\Mcp\Abilities\Abstract_Ability;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ability_Registry {

	/** @var array<string, Abstract_Ability> */
	private array $abilities = [];

	public function add( Abstract_Ability $ability ): void {
		$this->abilities[ $ability->get_id() ] = $ability;
	}

	/** @return Abstract_Ability[] */
	public function all(): array {
		return array_values( $this->abilities );
	}

	/** @return Abstract_Ability[] */
	public function tools(): array {
		return $this->filter_by_kind( Abstract_Ability::KIND_TOOL );
	}

	/** @return Abstract_Ability[] */
	public function resources(): array {
		return $this->filter_by_kind( Abstract_Ability::KIND_RESOURCE );
	}

	public function find_by_id( string $id ): ?Abstract_Ability {
		return $this->abilities[ $id ] ?? null;
	}

	public function find_by_proxy_slug( string $slug ): ?Abstract_Ability {
		foreach ( $this->abilities as $ability ) {
			if ( ! $ability->is_exposed_via_proxy() ) {
				continue;
			}

			if ( Abstract_Ability::KIND_TOOL === $ability->get_kind() && $ability->get_proxy_slug() === $slug ) {
				return $ability;
			}
		}

		return null;
	}

	public function find_resource_by_uri( string $uri ): ?Abstract_Ability {
		foreach ( $this->abilities as $ability ) {
			if ( Abstract_Ability::KIND_RESOURCE !== $ability->get_kind() ) {
				continue;
			}

			if ( $ability->get_uri() === $uri ) {
				return $ability;
			}
		}

		return null;
	}

	/** @return Abstract_Ability[] */
	private function filter_by_kind( string $kind ): array {
		return array_values( array_filter(
			$this->abilities,
			fn( Abstract_Ability $ability ) => $kind === $ability->get_kind()
		) );
	}
}
