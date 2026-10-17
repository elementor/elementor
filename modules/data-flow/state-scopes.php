<?php

namespace Elementor\Modules\DataFlow;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class State_Scopes {
	const SCOPE_ATTRIBUTE = 'data-e-scope';

	private array $page_state;

	private array $frames = [];

	private array $active_scopes = [];

	private array $scopes = [];

	public function __construct( array $page_state ) {
		$this->page_state = $page_state;
	}

	/**
	 * A component instance has no wrapper of its own, so its scope is owned by the instance but tagged on each
	 * of its root elements. Those roots declare the component params, so they don't open a scope of their own.
	 *
	 * @param array|null $component_params The instance's component params, or null when the element isn't an instance.
	 *
	 * @return string|null The scope id the element's root tag must carry, if any.
	 */
	public function enter( string $element_id, array $element_data, ?array $component_params = null ): ?string {
		$parent_frame = end( $this->frames );
		$component_scope_id = $parent_frame ? $parent_frame['roots_scope_id'] : null;

		if ( null !== $component_params ) {
			$values = State_Params::sanitize_values( $element_data[ State_Params::VALUES_DATA_KEY ] ?? [] );
			$params = State_Params::apply_values( $component_params, $values )['params'];

			$this->open_scope( $element_id, $params );
			$this->frames[] = $this->create_frame( true, $element_id );

			return $component_scope_id;
		}

		if ( null !== $component_scope_id ) {
			$this->frames[] = $this->create_frame( false );

			return $component_scope_id;
		}

		$params = State_Params::sanitize( $element_data[ State_Params::DATA_KEY ] ?? [] );

		if ( empty( $params ) ) {
			$this->frames[] = $this->create_frame( false );

			return null;
		}

		$this->open_scope( $element_id, $params );
		$this->frames[] = $this->create_frame( true );

		return $element_id;
	}

	public function leave(): void {
		$frame = array_pop( $this->frames );

		if ( $frame && $frame['opens_scope'] ) {
			array_pop( $this->active_scopes );
		}
	}

	public function merged_state(): array {
		return array_merge( $this->page_state, ...array_column( $this->active_scopes, 'state' ) );
	}

	public function active_states(): array {
		return array_column( $this->active_scopes, 'state', 'id' );
	}

	public function get_scopes(): array {
		return array_values( $this->scopes );
	}

	public function get_scope( string $scope_id ): ?array {
		return $this->scopes[ $scope_id ] ?? null;
	}

	public static function tag_root_element( string $html, string $scope_id, array $classes = [], array $variables = [] ): string {
		$processor = new \WP_HTML_Tag_Processor( $html );

		if ( ! $processor->next_tag() ) {
			return $html;
		}

		$processor->set_attribute( self::SCOPE_ATTRIBUTE, $scope_id );

		foreach ( $classes as $class ) {
			$processor->add_class( $class );
		}

		if ( ! empty( $variables ) ) {
			$processor->set_attribute( 'style', State_CSS::merge_style( (string) $processor->get_attribute( 'style' ), $variables ) );
		}

		return $processor->get_updated_html();
	}

	private function open_scope( string $scope_id, array $params ): void {
		$parent = end( $this->active_scopes );
		$state = State_Params::resolve( $params, $this->merged_state() );

		$this->scopes[ $scope_id ] = [
			'id' => $scope_id,
			'parentId' => $parent ? $parent['id'] : null,
			'state' => $state,
			'schema' => State_Schema::describe( $params ),
		];

		$this->active_scopes[] = [
			'id' => $scope_id,
			'state' => $state,
		];
	}

	private function create_frame( bool $opens_scope, ?string $roots_scope_id = null ): array {
		return [
			'opens_scope' => $opens_scope,
			'roots_scope_id' => $roots_scope_id,
		];
	}
}
