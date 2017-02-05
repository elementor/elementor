<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Post_CSS_File extends CSS_File {

	const META_KEY = '_elementor_css';

	const FILE_PREFIX = 'post-';

	/*
	 * @var int
	 */
	private $post_id;

	/**
	 * Post_CSS_File constructor.
	 *
	 * @param int $post_id
	 */
	public function __construct( $post_id ) {
		$this->post_id = $post_id;

		parent::__construct();
	}

	/**
	 * @return int
	 */
	public function get_post_id() {
		return $this->post_id;
	}

	/**
	 * @param Element_Base $element
	 *
	 * @return string
	 */
	public function get_element_unique_selector( Element_Base $element ) {
		return '.elementor-' . $this->post_id . ' .elementor-element' . $element->get_unique_selector();
	}

	/**
	 * @return array
	 */
	protected function load_meta() {
		return get_post_meta( $this->post_id, self::META_KEY, true );
	}

	/**
	 * @param string $meta
	 */
	protected function update_meta( $meta ) {
		update_post_meta( $this->post_id, '_elementor_css', $meta );
	}

	protected function render_css() {
		$data = Plugin::instance()->db->get_plain_editor( $this->post_id );

		foreach ( $data as $element_data ) {
			$element = Plugin::instance()->elements_manager->create_element_instance( $element_data );

			if ( ! $element ) {
				continue;
			}

			$this->render_styles( $element );
		}
	}

	protected function get_enqueue_dependencies() {
		return [ 'elementor-frontend' ];
	}

	protected function get_inline_dependency() {
		return 'elementor-frontend';
	}

	/**
	 * @param Element_Base $element
	 * @param array $controls
	 * @param array $values
	 * @param array $placeholders
	 * @param array $replacements
	 */
	private function add_element_style_rules( Element_Base $element, array $controls, array $values, array $placeholders, array $replacements ) {
		foreach ( $controls as $control ) {
			if ( ! empty( $control['style_fields'] ) ) {
				foreach ( $values[ $control['name'] ] as $field_value ) {
					$this->add_element_style_rules(
						$element,
						$control['style_fields'],
						$field_value,
						array_merge( $placeholders, [ '{{CURRENT_ITEM}}' ] ),
						array_merge( $replacements, [ '.elementor-repeater-item-' . $field_value['_id'] ] )
					);
				}
			}

			if ( ! $element->is_control_visible( $control, $values ) || empty( $control['selectors'] ) ) {
				continue;
			}

			$this->add_control_style_rules( $control, $values, $element->get_controls(), $placeholders, $replacements );
		}

		foreach ( $element->get_children() as $child_element ) {
			$this->render_styles( $child_element );
		}
	}

	/**
	 * @param array $control
	 * @param array $values
	 * @param array $controls_stack
	 * @param array $placeholders
	 * @param array $replacements
	 */
	private function add_control_style_rules( array $control, array $values, array $controls_stack, array $placeholders, array $replacements ) {
		$this->add_control_rules( $control, $controls_stack, function( $control ) use ( $values ) {
			return $this->get_style_control_value( $control, $values );
		}, $placeholders, $replacements );
	}

	/**
	 * @param array $control
	 * @param array $values
	 *
	 * @return mixed
	 */
	private function get_style_control_value( array $control, array $values ) {
		$value = $values[ $control['name'] ];

		if ( isset( $control['selectors_dictionary'][ $value ] ) ) {
			$value = $control['selectors_dictionary'][ $value ];
		}

		if ( ! is_numeric( $value ) && ! is_float( $value ) && empty( $value ) ) {
			return null;
		}

		return $value;
	}

	/**
	 * @param Element_Base $element
	 */
	private function render_styles( Element_Base $element ) {
		$element_settings = $element->get_settings();

		$this->add_element_style_rules( $element, $element->get_style_controls(), $element_settings,  [ '{{WRAPPER}}' ], [ $this->get_element_unique_selector( $element ) ] );

		if ( 'column' === $element->get_name() ) {
			if ( ! empty( $element_settings['_inline_size'] ) ) {
				$this->stylesheet_obj->add_rules( $this->get_element_unique_selector( $element ), [ 'width' => $element_settings['_inline_size'] . '%' ], [ 'min' => 'tablet' ] );
			}
		}

		/**
		 * @deprecated, use `elementor/element/parse_css`
		 */
		Utils::do_action_deprecated( 'elementor/element_css/parse_css',[ $this, $element ], '1.0.10', 'elementor/element/parse_css' );

		do_action( 'elementor/element/parse_css', $this, $element );
	}

	protected function get_file_handle_id() {
		return 'elementor-post-' . $this->post_id;
	}

	protected function get_file_name() {
		return self::FILE_PREFIX . $this->post_id;
	}
}
