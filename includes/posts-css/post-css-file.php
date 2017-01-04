<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Post_CSS_File {

	const FILE_BASE_DIR = '/elementor/css';
	// %s: Base folder; %s: file prefix; %d: post_id
	const FILE_NAME_PATTERN = '%s/%s%d.css';
	const FILE_PREFIX = 'post-';

	const CSS_STATUS_FILE = 'file';
	const CSS_STATUS_INLINE = 'inline';
	const CSS_STATUS_EMPTY = 'empty';

	const META_KEY_CSS = '_elementor_css';

	/*
	 * @var int
	 */
	protected $post_id;

	protected $is_built_with_elementor;

	protected $path;

	protected $url;

	protected $css = '';

	protected $fonts = [];

	/**
	 * @var Stylesheet
	 */
	protected $stylesheet_obj;
	protected $_columns_width;

	public static function add_control_rules( Stylesheet $stylesheet, array $control, array $controls_stack, callable $value_callback, array $placeholders, array $replacements ) {
		$value = call_user_func( $value_callback, $control );

		if ( null === $value ) {
			return;
		}

		foreach ( $control['selectors'] as $selector => $css_property ) {
			try {
				$output_css_property = preg_replace_callback( '/\{\{(?:([^.}]+)\.)?([^}]*)}}/', function( $matches ) use ( $control, $value_callback, $controls_stack, $value, $css_property ) {
					$parser_control = $control;

					$value_to_insert = $value;

					if ( ! empty( $matches[1] ) ) {
						$parser_control = $controls_stack[ $matches[1] ];

						$value_to_insert = call_user_func( $value_callback, $parser_control );
					}

					$control_obj = Plugin::instance()->controls_manager->get_control( $parser_control['type'] );

					$parsed_value = $control_obj->get_style_value( strtolower( $matches[2] ), $value_to_insert );

					if ( '' === $parsed_value ) {
						throw new \Exception();
					}

					return $parsed_value;
				}, $css_property );
			} catch ( \Exception $e ) {
				return;
			}

			if ( ! $output_css_property ) {
				continue;
			}

			$device_pattern = '/^\(([^\)]+)\)/';

			preg_match( $device_pattern, $selector, $device_rule );

			if ( $device_rule ) {
				$selector = preg_replace( $device_pattern, '', $selector );

				$device_rule = $device_rule[1];
			}

			$parsed_selector = str_replace( $placeholders, $replacements, $selector );

			$device = $device_rule;

			if ( ! $device ) {
				$device = ! empty( $control['responsive'] ) ? $control['responsive'] : Element_Base::RESPONSIVE_DESKTOP;
			}

			$stylesheet->add_rules( $parsed_selector, $output_css_property, $device );
		}
	}

	public function __construct( $post_id ) {
		$this->post_id = $post_id;

		// Check if it's an Elementor post
		$db = Plugin::instance()->db;

		$data = $db->get_plain_editor( $post_id );
		$edit_mode = $db->get_edit_mode( $post_id );

		$this->is_built_with_elementor = ( ! empty( $data ) && 'builder' === $edit_mode );

		if ( ! $this->is_built_with_elementor ) {
			return;
		}

		$this->set_path_and_url();
		$this->init_stylesheet();
	}

	public function update() {
		if ( ! $this->is_built_with_elementor() ) {
			return;
		}

		$this->parse_elements_css();

		$meta = [
			'version' => ELEMENTOR_VERSION,
			'time' => time(),
			'fonts' => array_unique( $this->fonts ),
		];

		if ( empty( $this->css ) ) {
			$this->delete();

			$meta['status'] = self::CSS_STATUS_EMPTY;
			$meta['css'] = '';
		} else {
			$file_created = false;

			if ( wp_is_writable( dirname( $this->path ) ) ) {
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
		if ( ! $this->is_built_with_elementor() ) {
			return;
		}

		$meta = $this->get_meta();

		if ( self::CSS_STATUS_EMPTY === $meta['status'] ) {
			return;
		}

		if ( apply_filters( 'elementor/css_file/update', version_compare( ELEMENTOR_VERSION, $meta['version'], '>' ), $this ) ) {
			$this->update();
			// Refresh new meta
			$meta = $this->get_meta();
		}

		if ( self::CSS_STATUS_INLINE === $meta['status'] ) {
			wp_add_inline_style( 'elementor-frontend', $meta['css'] );
		} else {
			wp_enqueue_style( 'elementor-post-' . $this->post_id, $this->url, [], $meta['time'] );
		}

		// Handle fonts
		if ( ! empty( $meta['fonts'] ) ) {
			foreach ( $meta['fonts'] as $font ) {
				Plugin::instance()->frontend->add_enqueue_font( $font );
			}
		}
	}

	public function is_built_with_elementor() {
		return $this->is_built_with_elementor;
	}

	/**
	 * @return int
	 */
	public function get_post_id() {
		return $this->post_id;
	}

	public function get_element_unique_selector( Element_Base $element ) {
		return '.elementor-' . $this->post_id . ' .elementor-element' . $element->get_unique_selector();
	}

	public function get_css() {
		if ( empty( $this->css ) ) {
			$this->parse_elements_css();
		}

		return $this->css;
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
		$relative_path = sprintf( self::FILE_NAME_PATTERN, self::FILE_BASE_DIR, self::FILE_PREFIX, $this->post_id );
		$this->path = $wp_upload_dir['basedir'] . $relative_path;
		$this->url = set_url_scheme( $wp_upload_dir['baseurl'] . $relative_path );
	}

	protected function get_meta() {
		$meta = get_post_meta( $this->post_id, self::META_KEY_CSS, true );

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
		if ( ! $this->is_built_with_elementor() ) {
			return;
		}

		$data = Plugin::instance()->db->get_plain_editor( $this->post_id );

		$css = '';

		foreach ( $data as $element_data ) {
			$element = Plugin::instance()->elements_manager->create_element_instance( $element_data );
			$this->render_styles( $element );
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

	public function get_stylesheet() {
		return $this->stylesheet_obj;
	}

	private function add_element_style_rules( Element_Base $element, $controls, $values, $placeholders, $replacements ) {
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

	private function add_control_style_rules( $control, $values, $controls_stack, $placeholders, $replacements ) {
		self::add_control_rules( $this->stylesheet_obj, $control, $controls_stack, function( $control ) use ( $values ) {
			$value = $this->get_style_control_value( $control, $values );

			if ( Controls_Manager::FONT === $control['type'] ) {
				$this->fonts[] = $value;
			}

			return $value;
		}, $placeholders, $replacements );
	}

	private function get_style_control_value( $control, $values ) {
		$value = $values[ $control['name'] ];

		if ( isset( $control['selectors_dictionary'][ $value ] ) ) {
			$value = $control['selectors_dictionary'][ $value ];
		}

		if ( ! is_numeric( $value ) && ! is_float( $value ) && empty( $value ) ) {
			return null;
		}

		return $value;
	}

	private function render_styles( Element_Base $element ) {
		$element_settings = $element->get_settings();

		$this->add_element_style_rules( $element, $element->get_style_controls(), $element_settings,  [ '{{WRAPPER}}' ], [ $this->get_element_unique_selector( $element ) ] );

		if ( 'column' === $element->get_name() ) {
			if ( ! empty( $element_settings['_inline_size'] ) ) {
				$this->_columns_width[] = $this->get_element_unique_selector( $element ) . '{width:' . $element_settings['_inline_size'] . '%;}';
			}
		}

		do_action( 'elementor/element_css/parse_css', $this, $element );
	}
}
