<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Post_CSS_File {

	const BASE_DIR = '/elementor/cache/css';

	// %s: Base folder; %d: post_id
	const CSS_FILENAME = '%s/post-%d.css';

	const CSS_STATUS_FILE = 'file';
	const CSS_STATUS_INLINE = 'inline';
	const CSS_STATUS_EMPTY = 'empty';

	protected $post_id;
	protected $is_build_with_elementor;
	protected $path;
	protected $url;
	protected $css = '';
	protected $fonts = [];

	/**
	 * @var Stylesheet
	 */
	protected $stylesheet_obj;
	protected $_columns_width;

	public function __construct( $post_id ) {
		$this->post_id = $post_id;

		// Check if it's an Elementor post
		$db = Plugin::instance()->db;

		$data = $db->get_plain_editor( $post_id );
		$edit_mode = $db->get_edit_mode( $post_id );

		$this->is_build_with_elementor = ( ! empty( $data ) && 'builder' === $edit_mode );

		if ( ! $this->is_build_with_elementor ) {
			return;
		}

		$this->set_path_and_url();
		$this->init_stylesheet();
	}

	public function update() {
		$this->parse_elements_css();

		$meta = [
			'version' => ELEMENTOR_VERSION,
			'fonts' => array_unique( $this->fonts ),
		];

		if ( empty( $this->css ) ) {
			$this->delete();

			$meta['status'] = self::CSS_STATUS_EMPTY;
			$meta['css'] = '';
		} else {

			$file_created = false;

			if ( wp_is_writable( $this->path ) ) {
				$file_created = file_put_contents( $this->path, $this->css );
			}

			if ( $file_created ) {
				$meta['status'] = self::CSS_STATUS_FILE;
			} else {
				$meta['status'] = self::CSS_STATUS_INLINE;
				$meta['css'] = $this->css;
			}
		}

		$this->update_meta( $meta );
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
			// Refresh new meta
			$meta = $this->get_meta();
		}

		if ( self::CSS_STATUS_INLINE === $meta['status'] ) {
			wp_add_inline_style( 'elementor-frontend', $meta['css'] );
		} else {
			wp_enqueue_style( 'elementor-post-' . $this->post_id, $this->url, [], $meta['version'] );
		}

		// Handle fonts
		if ( ! empty( $meta['fonts'] ) ) {
			foreach ( $meta['fonts'] as $font ) {
				Plugin::instance()->frontend->add_enqueue_font( $font );
			}
		}
	}

	public function is_build_with_elementor() {
		return $this->is_build_with_elementor;
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
		$relative_path = sprintf( self::CSS_FILENAME, self::BASE_DIR, $this->post_id );
		$this->path = $wp_upload_dir['basedir'] . $relative_path;
		$this->url = $wp_upload_dir['baseurl'] . $relative_path;
	}

	protected function get_meta() {
		$meta = get_post_meta( $this->post_id, '_elementor_css', true );

		$defaults = [
			'version' => '',
			'status'  => '',
		];

		$meta = wp_parse_args( $meta, $defaults );

		return $meta;
	}

	protected function update_meta( $meta ) {
		return update_post_meta( $this->post_id, '_elementor_css', $meta );
	}

	protected function parse_elements_css() {
		if ( ! $this->is_build_with_elementor() ) {
			return;
		}

		$data = Plugin::instance()->db->get_plain_editor( $this->post_id );

		$css = '';

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

		$this->css = $css;
	}

	protected function parse_style_item( Element_Base $element ) {
		$element_settings = $element->get_settings();

		$element_unique_class = '.elementor-' . $this->post_id . ' .elementor-element.elementor-element-' . $element->get_id();

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

			$control_obj = Plugin::instance()->controls_manager->get_control( $control['type'] );
			if ( ! $control_obj ) {
				continue;
			}

			if ( ! $element->is_control_visible( $control ) ) {
				continue;
			}

			if ( Controls_Manager::FONT === $control_obj->get_type() ) {
				$this->fonts[] = $control_value;
			}

			foreach ( $control['selectors'] as $selector => $css_property ) {
				$output_selector = str_replace( '{{WRAPPER}}', $element_unique_class, $selector );
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
