<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Toggle_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Query_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Number_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;
use Elementor\Modules\WpRest\Classes\Post_Query;
use Elementor\TemplateLibrary\Source_Local;
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

		$atomic_tags  = [];
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
			'name'            => $tag['name'],
			'categories'      => $tag['categories'],
			'label'           => $tag['title'] ?? '',
			'group'           => $tag['group'] ?? '',
			'atomic_controls' => [],
			'props_schema'    => $this->schemas->get( $tag['name'] ),
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
			'select'   => fn( $control ) => $this->convert_select_control_to_atomic( $control ),
			'text'     => fn( $control ) => $this->convert_text_control_to_atomic( $control ),
			'textarea' => fn( $control ) => $this->convert_textarea_control_to_atomic( $control ),
			'switcher' => fn( $control ) => $this->convert_switch_control_to_atomic( $control ),
			'number'   => fn( $control ) => $this->convert_number_control_to_atomic( $control ),
			'query'   => fn( $control ) => $this->convert_query_control_to_atomic( $control ),
			'choose'   => fn( $control ) => $this->convert_choose_control_to_atomic( $control ),
			'media'   => fn( $control ) => $this->convert_media_control_to_atomic( $control ),
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

		$select_control = Select_Control::bind_to( $control['name'] )
			->set_placeholder( $control['placeholder'] ?? '' )
			->set_options( $options )
			->set_label( $control['atomic_label'] ?? $control['label'] );

		if ( isset( $control['collection_id'] ) ) {
			$select_control->set_collection_id( $control['collection_id'] );
		}

		return $select_control;
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

	/**
	 * @param $control
	 *
	 * @return Switch_Control
	 */
	private function convert_switch_control_to_atomic( $control ) {
		return Switch_Control::bind_to( $control['name'] )
			->set_label( html_entity_decode( $control['atomic_label'] ?? $control['label'] ) );
	}

	/**
	 * @param $control
	 *
	 * @return Number_Control
	 */
	private function convert_number_control_to_atomic( $control ) {
		return Number_Control::bind_to( $control['name'] )
			->set_placeholder( $control['placeholder'] ?? '' )
			->set_max( $control['max'] ?? null )
			->set_min( $control['min'] ?? null )
			->set_step( $control['step'] ?? null )
			->set_should_force_int( $control['should_force_int'] ?? false )
			->set_label( $control['label'] );
	}

	private function convert_textarea_control_to_atomic( $control ) {
		return Textarea_Control::bind_to( $control['name'] )
			->set_placeholder( $control['placeholder'] ?? '' )
			->set_label( $control['label'] );
	}

	private function convert_query_control_to_atomic( $control ) {
		$query_config = [];

		if ( $this->is_control_elementor_query( $control ) ) {
			$post_types = [ Source_Local::CPT ];
			$query_config[ Post_Query::EXCLUDED_POST_TYPE_KEYS ] = [];
		} else {
			$post_types = isset( $control['autocomplete']['query']['post_type'] ) ? $control['autocomplete']['query']['post_type'] : [];
			$post_types = ! empty( $post_types ) && 'any' !== $post_types ? $post_types : null;
		}

		if ( isset( $control['autocomplete']['query']['posts_per_page'] ) ) {
			$query_config[ Post_Query::POSTS_PER_PAGE_KEY ] = $control['autocomplete']['query']['posts_per_page'];
		}

		if ( isset( $control['autocomplete']['query']['post_status'] ) && in_array( 'private', $control['autocomplete']['query']['post_status'] ) ) {
			$query_config[ Post_Query::IS_PUBLIC_KEY ] = false;
		}

		$query_config[ Post_Query::INCLUDED_POST_TYPE_KEY ] = $post_types;
		$query_config[ Post_Query::META_QUERY_KEY ] = $control['autocomplete']['query']['meta_query'] ?? null;

		$query_control = Query_Control::bind_to( $control['name'] );
		$query_control->set_query_config( $query_config );
		$query_control->set_placeholder( $control['placeholder'] ?? '' );
		$query_control->set_label( $control['label'] );
		$query_control->set_allow_custom_values( false );

		return $query_control;
	}

	private function is_control_elementor_query( $control ): bool {
		return isset( $control['autocomplete']['object'] ) && 'library_template' === $control['autocomplete']['object'];
	}

	private function convert_choose_control_to_atomic( $control ) {
		return Toggle_Control::bind_to( $control['name'] )
			->set_label( $control['atomic_label'] ?? $control['label'] )
			->add_options( $control['options'] )
			->set_size( 'tiny' )
			->set_exclusive( true )
			->set_convert_options( true );
	}

	private function convert_media_control_to_atomic( $control ) {
		return Image_Control::bind_to( $control['name'] )
			->set_show_mode( 'media' )
			->set_label( $control['label'] );
	}
}
