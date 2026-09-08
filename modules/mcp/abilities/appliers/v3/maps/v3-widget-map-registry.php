<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Widget_Map_Registry {

	/**
	 * @var V3_Widget_Map_Compiler
	 */
	private $compiler;

	/**
	 * @var callable
	 */
	private $is_experiment_active;

	/**
	 * @var callable
	 */
	private $is_atomic_active;

	/**
	 * @var callable
	 */
	private $get_controls;

	/**
	 * @var array<string, array<string, mixed>>
	 */
	private $maps;

	/**
	 * @var array<string, array<string, mixed>|WP_Error>
	 */
	private $cache = [];

	/**
	 * @param V3_Widget_Map_Compiler                        $compiler
	 * @param callable(): bool                              $is_experiment_active
	 * @param callable(): bool                              $is_atomic_active
	 * @param callable(string): (array<string, mixed>|null) $get_controls
	 * @param array<string, array<string, mixed>>           $maps
	 */
	public function __construct(
		V3_Widget_Map_Compiler $compiler,
		callable $is_experiment_active,
		callable $is_atomic_active,
		callable $get_controls,
		array $maps = []
	) {
		$this->compiler = $compiler;
		$this->is_experiment_active = $is_experiment_active;
		$this->is_atomic_active = $is_atomic_active;
		$this->get_controls = $get_controls;
		$this->maps = $maps;
	}

	public function is_experiment_active(): bool {
		$callback = $this->is_experiment_active;

		return (bool) $callback();
	}

	public function is_supported( string $widget_type ): bool {
		$compiled = $this->get_compiled_map( $widget_type );

		if ( null === $compiled || $compiled instanceof WP_Error ) {
			return false;
		}

		if ( V3_Widget_Map_Compiler::CATALOG_VISIBILITY_ALWAYS === $compiled['catalog_visibility'] ) {
			return true;
		}

		$is_atomic_active = $this->is_atomic_active;

		return ! (bool) $is_atomic_active();
	}

	/**
	 * @return array<string, mixed>|WP_Error|null
	 */
	public function get_compiled_map( string $widget_type ) {
		if ( ! $this->is_experiment_active() ) {
			return null;
		}

		if ( ! isset( $this->maps[ $widget_type ] ) ) {
			return null;
		}

		if ( array_key_exists( $widget_type, $this->cache ) ) {
			return $this->cache[ $widget_type ];
		}

		$get_controls = $this->get_controls;
		$controls = $get_controls( $widget_type ) ?? [];
		$compiled = $this->compiler->compile( $this->maps[ $widget_type ], $controls, $widget_type );

		$this->cache[ $widget_type ] = $compiled;

		return $compiled;
	}
}
