<?php

namespace Elementor\Modules\AtomicWidgets\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widgets_Ability extends Abstract_Ability {

	private Elements_Manager $elements_manager;
	private Breakpoints_Manager $breakpoints_manager;
	private string $prop_types_dir;

	public function __construct(
		Elements_Manager $elements_manager,
		Breakpoints_Manager $breakpoints_manager,
		string $prop_types_dir = ''
	) {
		$this->elements_manager    = $elements_manager;
		$this->breakpoints_manager = $breakpoints_manager;
		$this->prop_types_dir      = $prop_types_dir;

		if ( '' === $this->prop_types_dir ) {
			$this->prop_types_dir = ELEMENTOR_PATH . 'modules/atomic-widgets/prop-types';
		}
	}

	protected function get_name(): string {
		return 'elementor/atomic-widgets';
	}

	protected function get_config(): array {
		return [
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
					'style_schema'    => [
						'type'        => 'object',
						'description' => 'Full Elementor v4 style property schema.',
					],
					'prop_types'      => [
						'type'        => 'array',
						'description' => 'Registered atomic prop type file names.',
					],
					'atomic_elements' => [
						'type'        => 'array',
						'description' => 'Registered atomic element type names.',
					],
					'breakpoints'     => [
						'type'        => 'object',
						'description' => 'Active breakpoint configuration.',
					],
				],
			],
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
		];
	}

	public function execute( array $_input ): array {
		$style_schema = null;
		try {
			$style_schema = Style_Schema::get();
		} catch ( \Throwable $exception ) {
			$style_schema = [ 'error' => $exception->getMessage() ];
		}

		$prop_types = [];
		if ( is_dir( $this->prop_types_dir ) ) {
			$glob_result = glob( $this->prop_types_dir . '/*.php' );
			$files       = false !== $glob_result ? $glob_result : [];
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
