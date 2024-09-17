<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use Elementor\Modules\DynamicTags\Module as Dynamic_Tags_Module;

class Dynamic_Tags {
	public function register_hooks() {
		add_filter(
			'elementor/editor/localize_settings',
			fn( $settings ) => $this->add_atomic_dynamic_tags_settings( $settings )
		);

		add_filter(
			'elementor/atomic-widgets/props-schema',
			fn( array $schema ) => $this->add_dynamic_prop_type( $schema )
		);
	}

	/**
	 * Return a tuple that lets the developer ignore the dynamic prop type in the props schema
	 * using `Prop_Type::add_meta()`, e.g. `String_Prop_Type::make()->add_meta( Dynamic::ignore() )`.
	 */
	public static function ignore(): array {
		return [ 'dynamic', false ];
	}

	private function add_atomic_dynamic_tags_settings( $settings ) {
		if ( isset( $settings['dynamicTags']['tags'] ) ) {
			$settings['atomicDynamicTags'] = [
				'tags' => $this->convert_dynamic_tags_to_atomic( $settings['dynamicTags']['tags'] ),
			];
		}

		return $settings;
	}

	private function convert_dynamic_tags_to_atomic( $dynamic_tags ) {
		$result = [];

		foreach ( $dynamic_tags as $name => $tag ) {
			$atomic_tag = $this->convert_dynamic_tag_to_atomic( $tag );

			if ( $atomic_tag ) {
				$result[ $name ] = $atomic_tag;
			}
		}

		return $result;
	}

	private function convert_dynamic_tag_to_atomic( $tag ) {
		if ( ! isset( $tag['name'], $tag['categories'] ) ) {
			return null;
		}

		$atomic_dynamic_tag = [
			'name' => $tag['name'],
			'categories' => $tag['categories'],
			'label' => $tag['title'] ?? '',
			'group' => $tag['group'] ?? '',
			'atomic_controls' => [],
			'props_schema' => [],
		];

		if ( ! isset( $tag['controls'] ) ) {
			return $atomic_dynamic_tag;
		}

		try {
			['atomic_controls' => $controls, 'props_schema' => $props_schema] = $this->convert_controls_to_atomic( $tag['controls'] );

			$atomic_dynamic_tag['atomic_controls'] = $controls;
			$atomic_dynamic_tag['props_schema'] = $props_schema;
		} catch ( \Exception $e ) {
			return null;
		}

		return $atomic_dynamic_tag;
	}

	private function convert_controls_to_atomic( $controls ) {
		$atomic_controls = [];
		$props_schema = [];

		foreach ( $controls as $control ) {
			if ( 'section' === $control['type'] ) {
				continue;
			}

			['atomic_control' => $atomic_control, 'prop_schema' => $prop_schema] = $this->convert_control_to_atomic( $control );

			$section_name = $control['section'];

			if ( ! isset( $atomic_controls[ $section_name ] ) ) {
				$atomic_controls[ $section_name ] = Section::make()
					->set_label( $controls[ $section_name ]['label'] );
			}

			$section = $atomic_controls[ $section_name ];

			$section->set_items( array_merge( $section->get_items(), [ $atomic_control ] ) );

			$atomic_controls[ $section_name ] = $section;
			$props_schema[ $control['name'] ] = $prop_schema;
		}

		return [
			'atomic_controls' => array_values( $atomic_controls ),
			'props_schema' => $props_schema,
		];
	}

	private function convert_control_to_atomic( $control ) {
		$map = [
			'select' => fn( $control ) => $this->convert_select_control_to_atomic( $control ),
			'text' => fn( $control ) => $this->convert_text_control_to_atomic( $control ),
		];

		if ( ! isset( $map[ $control['type'] ] ) ) {
			throw new \Exception( 'Control type is not allowed' );
		}

		return $map[ $control['type'] ]( $control );
	}

	/**
	 * @param $control
	 *
	 * @throws \Exception
	 * @return array{ atomic_control: Select_Control, prop_schema: String_Prop_Type }
	 */
	private function convert_select_control_to_atomic( $control ) {
		if ( ! isset( $control['options'] ) ) {
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

		$atomic_control = Select_Control::bind_to( $control['name'] )
			->set_label( $control['label'] )
			->set_options( $options );

		$prop_schema = String_Prop_Type::make()
			->enum( array_keys( $control['options'] ) )
			->default( $control['default'] );

		return [
			'atomic_control' => $atomic_control,
			'prop_schema' => $prop_schema,
		];
	}

	/**
	 * @param $control
	 *
	 * @return array{ atomic_control: Text_Control, prop_schema: String_Prop_Type }
	 */
	private function convert_text_control_to_atomic( $control ) {
		$atomic_control = Text_Control::bind_to( $control['name'] )
			->set_label( $control['label'] );

		$prop_schema = String_Prop_Type::make()
			->default( $control['default'] );

		return [
			'atomic_control' => $atomic_control,
			'prop_schema' => $prop_schema,
		];
	}

	/**
	 * @param array<string, Prop_Type> $schema
	 *
	 * @return array<string, Prop_Type>
	 */
	private function add_dynamic_prop_type( array $schema ): array {
		foreach ( $schema as $prop ) {
			if ( ! ( $prop instanceof Prop_Type ) ) {
				continue;
			}

			if ( false === $prop->get_meta( 'dynamic' ) ) {
				continue;
			}

			if ( $prop instanceof Number_Prop_Type ) {
				$prop->additional_type(
					Dynamic_Prop_Type::make()->categories( [ Dynamic_Tags_Module::NUMBER_CATEGORY ] )
				);

				continue;
			}

			if ( $prop instanceof Image_Prop_Type ) {
				$prop->additional_type(
					Dynamic_Prop_Type::make()->categories( [ Dynamic_Tags_Module::IMAGE_CATEGORY ] )
				);

				continue;
			}

			if ( $prop instanceof String_Prop_Type && empty( $prop->get_enum() ) ) {
				$prop->additional_type(
					Dynamic_Prop_Type::make()->categories( [ Dynamic_Tags_Module::TEXT_CATEGORY ] )
				);

				continue;
			}
		}

		return $schema;
	}
}
