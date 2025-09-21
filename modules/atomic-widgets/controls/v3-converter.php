<?php

namespace Elementor\Modules\AtomicWidgets\Controls;

use Elementor\Modules\AtomicWidgets\Controls\Types\Query_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Number_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Query\Query_Builder;
use Elementor\Modules\WpRest\Base\Query as Query_Base;
use Elementor\Modules\WpRest\Classes\Post_Query;
use Elementor\Modules\WpRest\Classes\Term_Query;
use Elementor\Modules\WpRest\Classes\User_Query;
use Elementor\TemplateLibrary\Source_Local;

class V3_Converter {
	private $original_controls;
	private $atomic_controls = [];
	private $did_error = false;

	public function __construct( $original_controls ) {
		$this->original_controls = $original_controls;
		$this->set_atomic_controls();
	}

	public static function make( $original_controls ) {
		return new static( $original_controls );
	}

	public function get_atomic_controls( $force = false ) {
		return ! $this->did_error || $force ? array_values( $this->atomic_controls ) : null;
	}

	private function set_atomic_controls() {
		$this->set_control_sections();

		foreach ( $this->original_controls as $control ) {
			$control_type = isset( $control['type'] ) ? $control['type'] : null;

			if ( ! $control_type || 'section' === $control_type ) {
				continue;
			}

			$atomic_control = $this->convert( $control );
			$section_name = $control['section'];

			if ( ! $atomic_control ) {
				$this->did_error = true;

				continue;
			}

			$this->atomic_controls[ $section_name ] = $this->atomic_controls[ $section_name ]->add_item( $atomic_control );
		}

		return $this;
	}

	private function set_control_sections() {
		foreach ( $this->original_controls as $control ) {
			$control_type = isset( $control['type'] ) ? $control['type'] : null;

			if ( ! $control_type || 'section' !== $control_type ) {
				continue;
			}

			$section_name = $control['name'];
			$section_label = html_entity_decode( $control['label'] );

			$this->atomic_controls[ $section_name ] = Section::make()
				->set_label( $section_label );
		}
	}

	private function convert( $control ) {
		$method_map = [
			'select' => [ $this, 'get_select_control' ],
			'text' => [ $this, 'get_text_control' ],
			'switcher' => [ $this, 'get_switch_control' ],
			'number' => [ $this, 'get_number_control' ],
			'textarea' => [ $this, 'get_textarea_control' ],
			'query' => [ $this, 'get_query_control' ],
		];

		$control_type = $control['type'];
		$is_convertible = isset(
			$method_map[ $control_type ],
			$control['name'],
			$control['section'],
			$control['label'],
			$control['default']
		);

		if ( ! $is_convertible ) {
			throw new \Exception( 'Control must have name, section, label, and default' );
		}

		return $method_map[ $control_type ]( $control );
	}

	/**
	 * @param $control
	 *
	 * @return Select_Control
	 * @throws \Exception If control is missing options.
	 */
	private function get_select_control( $control ) {
		if ( empty( $control['options'] ) ) {
			throw new \Exception( 'Select control must have options' );
		}

		$options = array_map(
			fn ( $key, $value ) => [
				'value' => $key,
				'label' => html_entity_decode( $value ),
			],
			array_keys( $control['options'] ),
			$control['options']
		);

		$select_control = Select_Control::bind_to( $control['name'] )
			->set_placeholder( html_entity_decode( $control['placeholder'] ?? '' ) )
			->set_options( $options )
			->set_label( html_entity_decode( $control['atomic_label'] ?? $control['label'] ) );

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
	private function get_text_control( $control ) {
		return Text_Control::bind_to( $control['name'] )
			->set_label( html_entity_decode( $control['label'] ) );
	}

	/**
	 * @param $control
	 *
	 * @return Switch_Control
	 */
	private function get_switch_control( $control ) {
		return Switch_Control::bind_to( $control['name'] )
			->set_label( html_entity_decode( $control['atomic_label'] ?? $control['label'] ) );
	}

	/**
	 * @param $control
	 *
	 * @return Number_Control
	 */
	private function get_number_control( $control ) {
		return Number_Control::bind_to( $control['name'] )
			->set_placeholder( html_entity_decode( $control['placeholder'] ?? '' ) )
			->set_max( $control['max'] ?? null )
			->set_min( $control['min'] ?? null )
			->set_step( $control['step'] ?? null )
			->set_should_force_int( $control['should_force_int'] ?? false )
			->set_label( html_entity_decode( $control['label'] ) );
	}

	private function get_textarea_control( $control ) {
		return Textarea_Control::bind_to( $control['name'] )
			->set_placeholder( html_entity_decode( $control['placeholder'] ?? '' ) )
			->set_label( html_entity_decode( $control['label'] ) );
	}

	private function get_query_control( $control ) {
		$query_config = [];
		$query_type = Post_Query::ENDPOINT;

		switch ( true ) {
			case $this->is_control_term_query( $control ):
				$query_type = Term_Query::ENDPOINT;
				$included_types = null;
				$excluded_types = [];
				break;

			case  $this->is_control_elementor_query( $control ):
				$included_types = [ Source_Local::CPT ];
				$excluded_types = [];
				break;

			case  $this->is_control_attachment_query( $control ):
				$included_types = [ 'attachment' ];
				$excluded_types = [];
				$query_config[ Query_Base::IS_PUBLIC_KEY ] = false;
				break;

			case  $this->is_control_user_query( $control ):
				$included_types = [ $control['autocomplete']['object'] ];
				$excluded_types = null;
				$query_type = User_Query::ENDPOINT;
				break;

			default:
				$included_types = isset( $control['autocomplete']['query']['post_type'] ) ? $control['autocomplete']['query']['post_type'] : [];
				$included_types = ! empty( $included_types ) && 'any' !== $included_types ? $included_types : null;
				$excluded_types = null;
		}

		if ( isset( $control['autocomplete']['query']['posts_per_page'] ) ) {
			$query_config[ Query_Base::ITEMS_COUNT_KEY ] = $control['autocomplete']['query']['posts_per_page'];
		}

		if ( isset( $control['autocomplete']['query']['post_status'] ) && in_array( 'private', $control['autocomplete']['query']['post_status'] ) ) {
			$query_config[ Query_Base::IS_PUBLIC_KEY ] = false;
		}

		$query_config[ Query_Base::INCLUDED_TYPE_KEY ] = $included_types;
		$query_config[ Query_Base::EXCLUDED_TYPE_KEY ] = $excluded_types;
		$query_config[ Query_Builder::QUERY_TYPE_KEY ] = $query_type;
		$query_config[ Query_Base::META_QUERY_KEY ] = $control['autocomplete']['query']['meta_query'] ?? null;

		$query_control = Query_Control::bind_to( $control['name'] );
		$query_control->set_query_config( $query_config );
		$query_control->set_placeholder( html_entity_decode( $control['placeholder'] ?? '' ) );
		$query_control->set_label( html_entity_decode( $control['label'] ) );
		$query_control->set_allow_custom_values( false );

		return $query_control;
	}

	private function is_control_elementor_query( $control ): bool {
		return isset( $control['autocomplete']['object'] ) && 'library_template' === $control['autocomplete']['object'];
	}

	private function is_control_term_query( $control ): bool {
		return isset( $control['autocomplete']['object'] ) && in_array( $control['autocomplete']['object'], [ 'tax', 'taxonomy', 'term' ], true );
	}

	private function is_control_attachment_query( $control ): bool {
		return isset( $control['autocomplete']['object'] ) && 'attachment' === $control['autocomplete']['object'];
	}

	private function is_control_user_query( $control ): bool {
		global $wp_roles;
		$roles = array_keys( $wp_roles->roles );

		return isset( $control['autocomplete']['object'] ) && in_array( $control['autocomplete']['object'], $roles, true );
	}
}
