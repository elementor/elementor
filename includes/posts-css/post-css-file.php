<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
} // Exit if accessed directly

class Post_Css_File {

	const BASE_DIR = '/elementor/cache/css';

	const CSS_STATUS_FILE = 'file';
	const CSS_STATUS_INLINE = 'inline';
	const CSS_STATUS_EMPTY = 'empty';

	protected $post_id;
	protected $path;
	protected $url;
	/**
	 * @var Stylesheet
	 */
	protected $stylesheet_obj;
	protected $_columns_width;

	public function __construct( $post_id ) {
		$this->post_id = $post_id;
		$this->set_path_and_url();
		$this->init_stylesheet();
	}

	public function update() {
		$css  = $this->parse_elements_css();

		if ( '' === $css ) {
			$this->delete();

			$this->update_meta(
				[
					'status' => self::CSS_STATUS_EMPTY,
				]
			);

			return;
		}

		$created = @file_put_contents( $this->path, $css );

		if ( $created ) {

			$this->update_meta(
				[
					'version' => ELEMENTOR_VERSION,
					'status' => self::CSS_STATUS_FILE,
				]
			);

		} else {

			$this->update_meta(
				[
					'version' => ELEMENTOR_VERSION,
					'status' => self::CSS_STATUS_INLINE,
					'css' => $css,
				]
			);
		}
	}

	public function delete() {
		if ( file_exists( $this->path ) ) {
			unlink( $this->path );
		}
	}

	public function enqueue() {
		$meta = $this->get_meta();

		if ( self::CSS_STATUS_EMPTY === $meta['status'] ) {
			return;
		}

		if ( version_compare( ELEMENTOR_VERSION, $meta['version'], '>' ) ) {
			$this->update();
			//refresh new meta
			$meta = $this->get_meta();
		}

		if ( self::CSS_STATUS_INLINE === $meta['status'] ) {
			wp_add_inline_style( 'elementor-frontend', $meta['css'] );
		} else {
			wp_enqueue_style( 'elementor-post-' . $this->post_id, $this->url, [], $meta['version'] );
		}
	}

	protected function init_stylesheet() {
		$this->stylesheet_obj = new Stylesheet();

		$breakpoints = Responsive::get_breakpoints();

		$this->stylesheet_obj
			->add_device( 'mobile', $breakpoints['md'] - 1 )
			->add_device( 'tablet', $breakpoints['lg'] - 1 );
	}

	protected function set_path_and_url() {
		$wp_upload_dir = wp_upload_dir( null, false );
		$relative_path = sprintf( '%s/post-%d.css', self::BASE_DIR, $this->post_id );
		$this->path    = $wp_upload_dir['basedir'] . $relative_path;
		$this->url     = $wp_upload_dir['baseurl'] . $relative_path;
	}

	protected function get_meta() {
		return get_post_meta( $this->post_id, '_elementor_css', true );
	}

	protected function update_meta( $meta ) {
		$defaults = [
			'version' => '',
			'status' => '',
		];

		$meta = wp_parse_args( $meta, $defaults );

		return update_post_meta( $this->post_id, '_elementor_css', $meta );
	}

	protected function parse_elements_css() {
		$css       = '';
		$plugin    = Plugin::instance();
		$data      = $plugin->db->get_plain_editor( $this->post_id );
		$edit_mode = $plugin->db->get_edit_mode( $this->post_id );

		if ( empty( $data ) || 'builder' !== $edit_mode ) {
			return $css;
		}

		foreach ( $data as $section_data ) {
			$section = new Element_Section( $section_data );
			$this->parse_style_item( $section );
		}

		$css .= $this->stylesheet_obj;

		if ( ! empty( $this->_columns_width ) ) {
			$css .= '@media (min-width: 768px) {';
			foreach ( $this->_columns_width as $column_width ) {
				$css .= $column_width;
			}
			$css .= '}';
		}

		return $css;
	}

	protected function parse_style_item( Element_Base $element ) {
		$plugin = Plugin::instance();

		$element_settings = $element->get_settings();

		$element_unique_class = '.elementor-element.elementor-element-' . $element->get_id();

		if ( 'column' === $element->get_name() ) {
			if ( ! empty( $element_settings['_inline_size'] ) ) {
				$this->_columns_width[] = $element_unique_class . '{width:' . $element_settings['_inline_size'] . '%;}';
			}
		}

		foreach ( $element->get_style_controls() as $control ) {
			if ( ! isset( $element_settings[ $control['name'] ] ) ) {
				continue;
			}

			$control_value = $element_settings[ $control['name'] ];
			if ( ! is_numeric( $control_value ) && ! is_float( $control_value ) && empty( $control_value ) ) {
				continue;
			}

			$control_obj = $plugin->controls_manager->get_control( $control['type'] );
			if ( ! $control_obj ) {
				continue;
			}

			if ( ! $element->is_control_visible( $control ) ) {
				continue;
			}

			if ( Controls_Manager::FONT === $control_obj->get_type() ) {
				$plugin->frontend->_add_enqueue_font( $control_value );
			}

			foreach ( $control['selectors'] as $selector => $css_property ) {
				$output_selector     = str_replace( '{{WRAPPER}}', $element_unique_class, $selector );
				$output_css_property = $control_obj->get_replace_style_values( $css_property, $control_value );

				if ( ! $output_css_property ) {
					continue;
				}

				$device = ! empty( $control['responsive'] ) ? $control['responsive'] : Element_Base::RESPONSIVE_DESKTOP;

				$this->stylesheet_obj->add_rules( $output_selector, $output_css_property, $device );
			}
		}

		$children = $element->get_children();

		if ( ! empty( $children ) ) {
			foreach ( $children as $child_element ) {
				$this->parse_style_item( $child_element );
			}
		}
	}
}
