<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Tags_Editor_Config {

	private Dynamic_Tags_Schemas $schemas;

	private ?array $tags = null;

	public function __construct( Dynamic_Tags_Schemas $schemas ) {
		$this->schemas = $schemas;
	}

	public function get_tags(): array {
		if ( null !== $this->tags ) {
			return $this->tags;
		}

		$atomic_tags = [];
		$dynamic_tags = Plugin::$instance->dynamic_tags->get_tags_config();

		foreach ( $dynamic_tags as $name => $tag ) {
			$atomic_tag = $this->convert_dynamic_tag_to_atomic( $tag );

			if ( $atomic_tag ) {
				$atomic_tags[ $name ] = $atomic_tag;
			}
		}

		$this->tags = $atomic_tags;

		return $this->tags;
	}

	/**
	 * @param string $name
	 *
	 * @return null|array{
	 *       name: string,
	 *       categories: string[],
	 *       label: string,
	 *       group: string,
	 *       atomic_controls: array,
	 *       props_schema: array<string, Transformable_Prop_Type>
	 *  }
	 */
	public function get_tag( string $name ): ?array {
		$tags = $this->get_tags();

		return $tags[ $name ] ?? null;
	}

	private function convert_dynamic_tag_to_atomic( $tag ) {
		if ( empty( $tag['name'] ) || empty( $tag['categories'] ) ) {
			return null;
		}

		$converted_tag = [
			'name' => $tag['name'],
			'categories' => $tag['categories'],
			'label' => $tag['title'] ?? '',
			'group' => $tag['group'] ?? '',
			'atomic_controls' => [],
			'props_schema' => $this->schemas->get( $tag['name'] ),
		];

		if ( ! isset( $tag['controls'] ) ) {
			return $converted_tag;
		}

		try {
			$atomic_controls = $this->convert_controls_to_atomic( $tag['controls'], $tag['force_convert_to_atomic'] ?? false );
		} catch ( \Exception $e ) {
			return null;
		}

		if ( null === $atomic_controls ) {
			return null;
		}

		$converted_tag['atomic_controls'] = $atomic_controls;

		return $converted_tag;
	}

	private function convert_controls_to_atomic( $controls, $force = false ) {
		$atomic_controls = [];

		foreach ( $controls as $control ) {
			if ( 'section' === $control['type'] ) {
				continue;
			}

			$atomic_control = $this->convert_control_to_atomic( $control );

			if ( ! $atomic_control ) {
				if ( $force ) {
					continue;
				}

				return null;
			}

			$section_name = $control['section'];

			if ( ! isset( $atomic_controls[ $section_name ] ) ) {
				$atomic_controls[ $section_name ] = Section::make()
					->set_label( $controls[ $section_name ]['label'] );
			}

			$atomic_controls[ $section_name ] = $atomic_controls[ $section_name ]->add_item( $atomic_control );
		}

		return array_values( $atomic_controls );
	}

	private function convert_control_to_atomic( $control ) {
		$map = [
			'select' => fn( $control ) => $this->convert_select_control_to_atomic( $control ),
			'text' => fn( $control ) => $this->convert_text_control_to_atomic( $control ),
		];

		if ( ! isset( $map[ $control['type'] ] ) ) {
			return null;
		}

		$is_convertable = ! isset( $control['name'], $control['section'], $control['label'], $control['default'] );

		if ( $is_convertable ) {
			throw new \Exception( 'Control must have name, section, label, and default' );
		}

		return $map[ $control['type'] ]( $control );
	}

	/**
	 * @param $control
	 *
	 * @return Select_Control
	 * @throws \Exception If control is missing options.
	 */
	private function convert_select_control_to_atomic( $control ) {
		if ( empty( $control['options'] ) ) {
			throw new \Exception( 'Select control must have options' );
		}

		$options = array_map(
			fn( $key, $value ) => [
				'value' => $key,
				'label' => $value,
			],
			array_keys( $control['options'] ),
			$control['options']
		);

		return Select_Control::bind_to( $control['name'] )
			->set_label( $control['label'] )
			->set_options( $options );
	}

	/**
	 * @param $control
	 *
	 * @return Text_Control
	 */
	private function convert_text_control_to_atomic( $control ) {
		return Text_Control::bind_to( $control['name'] )
			->set_label( $control['label'] );
	}
}
