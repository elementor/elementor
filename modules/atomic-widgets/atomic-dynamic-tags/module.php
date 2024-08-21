<?php

namespace Elementor\Modules\AtomicWidgets\AtomicDynamicTags;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;
use Elementor\Modules\AtomicWidgets\Schema\Constraints\Enum;

class Module {
	public function register_hooks() {
		add_filter( 'elementor/editor/localize_settings', fn( $settings ) => $this::add_atomic_dynamic_tags_settings( $settings ) );
	}

	private function add_atomic_dynamic_tags_settings( $settings ) {
		$settings['atomicDynamicTags'] = self::transform_dynamic_tags_to_atomic( $settings['dynamicTags']['tags'] );

		return $settings;
	}

	public static function transform_dynamic_tags_to_atomic( $dynamic_tags ) {
		$result = [];

		foreach ( $dynamic_tags as $tag ) {
			$atomic_tag = self::transform_dynamic_tag_to_atomic( $tag );
			if ( $atomic_tag ) {
				$result[] = $atomic_tag;
			}
		}

		return $result;
	}

	private static function transform_dynamic_tag_to_atomic( $tag ) {
		if ( ! $tag['controls'] ) {
			return [
				'name' => $tag['name'],
				'label' => $tag['title'],
				'group' => $tag['group'],
				'categories' => $tag['categories'],
			];
		}

		try {
			['controls' => $controls, 'props_schema' => $props_schema] = self::transform_controls_to_atomic( $tag['controls'] );
			$tag['controls'] = $controls;
			$tag['props_schema'] = $props_schema;
		} catch ( \Exception $e ) {
			return null;
		}

		return [
			'name' => $tag['name'],
			'label' => $tag['title'],
			'group' => $tag['group'],
			'categories' => $tag['categories'],
			'controls' => $tag['controls'],
			'props_schema' => $tag['props_schema'],
		];
	}

	private static function transform_controls_to_atomic( $controls ) {
		$atomic_controls = [];
		$props_schema = [];

		foreach ( $controls as $control ) {
			if ( 'section' === $control['type'] ) {
				continue;
			}

			['atomic_control' => $atomic_control, 'prop_schema' => $prop_schema] = self::transform_control_to_atomic( $control );

			$section_name = $control['section'];
			if ( ! isset( $atomic_controls[ $section_name ] ) ) {
				$atomic_controls[ $section_name ] = Section::make()
					->set_label( $controls[ $section_name ]['label'] );
			}

			$section = $atomic_controls[ $control['section'] ];

			$section->set_items( array_merge( $section->get_items(), [ $atomic_control ] ) );

			$atomic_controls[ $section_name ] = $section;
			$props_schema[ $control['name'] ] = $prop_schema;
		}

		return [
			'controls' => array_values( $atomic_controls ),
			'props_schema' => $props_schema,
		];
	}

	public static function transform_control_to_atomic( $control ) {
		if ( 'select' === $control['type'] ) {
			return self::transform_select_control_to_atomic( $control );
		}

		if ( 'text' === $control['type'] ) {
			return self::transform_text_control_to_atomic( $control );
		}

		throw new \Exception( 'Control type is not allowed' );
	}

	public static function transform_select_control_to_atomic( $control ) {
		if ( ! isset( $control['options'] ) ) {
			throw new \Exception( 'Select control must have options' );
		}

		$options = array_map( function ( $key, $value ) {
			return [
				'value' => $key,
				'label' => $value,
			];
		}, array_keys( $control['options'] ), $control['options'] );

		$atomic_control = Select_Control::bind_to( $control['name'] )
			->set_label( $control['label'] )
			->set_options( $options );

		$prop_schema = Atomic_Prop::make()
			->string()
			->default( $control['default'] )
			->constraints( [ Enum::make( array_keys( $control['options'] ) ) ] );

		return [
			'atomic_control' => $atomic_control,
			'prop_schema' => $prop_schema,
		];
	}

	public static function transform_text_control_to_atomic( $control ) {
		$atomic_control = Text_Control::bind_to( $control['name'] )
			->set_label( $control['label'] );

		$prop_schema = Atomic_Prop::make()
			->string()
			->default( $control['default'] );

		return [
			'atomic_control' => $atomic_control,
			'prop_schema' => $prop_schema,
		];
	}
}
