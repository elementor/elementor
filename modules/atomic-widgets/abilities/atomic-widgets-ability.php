<?php

namespace Elementor\Modules\AtomicWidgets\Abilities;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widgets_Ability {

	public function __construct(
		private Elements_Manager $elements_manager,
		private Breakpoints_Manager $breakpoints_manager,
		private string $prop_types_dir = ''
	) {
		if ( '' === $this->prop_types_dir ) {
			$this->prop_types_dir = ELEMENTOR_PATH . 'modules/atomic-widgets/prop-types';
		}
	}

	public function register_hooks(): void {
		add_action( 'wp_abilities_api_init', [ $this, 'register_ability' ] );
	}

	public function register_ability(): void {
		wp_register_ability( 'elementor/atomic-widgets', [
			'label'       => 'Elementor Atomic Widgets Context',
			'description' => 'Returns style schema, prop types, registered atomic element types, and breakpoints for the Elementor v4 atomic widget system.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'                 => 'object',
				'properties'           => [],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'style_schema'    => [ 'type' => 'object',  'description' => 'Full Elementor v4 style property schema.' ],
					'prop_types'      => [ 'type' => 'array',   'description' => 'Registered atomic prop type file names.' ],
					'atomic_elements' => [ 'type' => 'array',   'description' => 'Registered atomic element type names.' ],
					'breakpoints'     => [ 'type' => 'object',  'description' => 'Active breakpoint configuration.' ],
				],
			],
			'execute_callback'    => [ $this, 'execute' ],
			'permission_callback' => [ $this, 'permission' ],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Returns the Elementor v4 atomic widget system context.',
						'Call before working with styles, prop types, or element registration.',
						'- style_schema: all supported CSS prop keys and their types',
						'- prop_types: available prop type file names',
						'- atomic_elements: registered element type identifiers (e-heading, e-flexbox, etc.)',
						'- breakpoints: active responsive breakpoint config',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		] );
	}

	public function permission(): bool {
		return current_user_can( 'manage_options' );
	}

	public function execute( array $input ): array {
		$style_schema = null;
		try {
			$style_schema = Style_Schema::get();
		} catch ( \Throwable $exception ) {
			$style_schema = [ 'error' => $exception->getMessage() ];
		}

		$prop_types = [];
		if ( is_dir( $this->prop_types_dir ) ) {
			$files = glob( $this->prop_types_dir . '/*.php' ) ?: [];
			foreach ( $files as $file ) {
				$prop_types[] = basename( $file, '.php' );
			}
		}

		$atomic_elements = [];
		try {
			$element_types = $this->elements_manager->get_element_types();
			foreach ( $element_types as $type => $object ) {
				if ( $object instanceof Atomic_Widget_Base ) {
					$atomic_elements[] = $type;
				}
			}
		} catch ( \Throwable $exception ) {
			$atomic_elements = [ 'error' => $exception->getMessage() ];
		}

		$breakpoints = $this->breakpoints_manager->get_breakpoints_config();

		return [
			'style_schema'    => $style_schema,
			'prop_types'      => $prop_types,
			'atomic_elements' => $atomic_elements,
			'breakpoints'     => $breakpoints,
		];
	}
}
