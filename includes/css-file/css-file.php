<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class CSS_File {

	const FILE_BASE_DIR = '/elementor/css';
	// %s: Base folder; %s: file name
	const FILE_NAME_PATTERN = '%s/%s.css';

	const CSS_STATUS_FILE = 'file';
	const CSS_STATUS_INLINE = 'inline';
	const CSS_STATUS_EMPTY = 'empty';

	/**
	 * @var string
	 */
	private $path;

	/**
	 * @var string
	 */
	private $url;

	/**
	 * @var string
	 */
	private $css;

	/**
	 * @var array
	 */
	private $fonts = [];

	/**
	 * @var Stylesheet
	 */
	protected $stylesheet_obj;

	/**
	 * @var array
	 */
	private static $printed = [];

	/**
	 * @abstract
	 * @since 1.6.0
	 * @access public
	*/
	abstract public function get_name();

	/**
	 * CSS_File constructor.
	 * @since 1.2.0
	 * @access public
	 */
	public function __construct() {
		if ( $this->use_external_file() ) {
			$this->set_path_and_url();
		}

		$this->init_stylesheet();
	}

	/**
	 * @since 1.9.0
	 * @access protected
	 */
	protected function use_external_file() {
		return 'internal' !== get_option( 'elementor_css_print_method' );
	}

	/**
	 * @since 1.2.0
	 * @access public
	*/
	public function update() {
		$this->parse_css();

		$meta = [
			'time' => time(),
			'fonts' => array_unique( $this->fonts ),
		];

		if ( empty( $this->css ) ) {
			$this->delete();

			$meta['status'] = self::CSS_STATUS_EMPTY;
			$meta['css'] = '';
		} else {
			$file_created = false;
			$use_external_file = $this->use_external_file();

			if ( $use_external_file && wp_is_writable( dirname( $this->path ) ) ) {
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

	/**
	 * @since 1.2.0
	 * @access public
	*/
	public function delete() {
		if ( file_exists( $this->path ) ) {
			unlink( $this->path );
		}
	}

	/**
	 * @since 1.2.0
	 * @access public
	*/
	public function enqueue() {
		$handle_id = $this->get_file_handle_id();

		if ( isset( self::$printed[ $handle_id ] ) ) {
			return;
		}

		self::$printed[ $handle_id ] = true;

		$meta = $this->get_meta();

		if ( self::CSS_STATUS_EMPTY === $meta['status'] ) {
			return;
		}

		// First time after clear cache and etc.
		if ( '' === $meta['status'] || $this->is_update_required() ) {
			$this->update();

			$meta = $this->get_meta();
		}

		if ( self::CSS_STATUS_INLINE === $meta['status'] ) {
			$dep = $this->get_inline_dependency();
			// If the dependency has already been printed ( like a template in footer )
			if ( wp_styles()->query( $dep, 'done' ) ) {
				printf( '<style id="%s">%s</style>', $this->get_file_handle_id(), $meta['css'] ); // XSS ok.
			} else {
				wp_add_inline_style( $dep , $meta['css'] );
			}
		} elseif ( self::CSS_STATUS_FILE === $meta['status'] ) { // Re-check if it's not empty after CSS update.
			wp_enqueue_style( $this->get_file_handle_id(), $this->url, $this->get_enqueue_dependencies(), $meta['time'] );
		}

		// Handle fonts.
		if ( ! empty( $meta['fonts'] ) ) {
			foreach ( $meta['fonts'] as $font ) {
				Plugin::$instance->frontend->enqueue_font( $font );
			}
		}

		$name = $this->get_name();

		/**
		 * CSS file enqueue.
		 *
		 * Fires when CSS file is enqueued on Elementor.
		 *
		 * The dynamic portion of the hook name, `$name`, refers to the CSS file name.
		 *
		 * @since 1.9.0
		 *
		 * @param CSS_File $this The current CSS file.
		 */
		do_action( "elementor/{$name}-css-file/enqueue", $this );
	}

	public function print_css() {
		echo '<style>' . $this->get_css() . '</style>';
		Plugin::$instance->frontend->print_fonts_links();
	}

	/**
	 * @since 1.2.0
	 * @access public
	 * @param array    $control
	 * @param array    $controls_stack
	 * @param callable $value_callback
	 * @param array    $placeholders
	 * @param array    $replacements
	 */
	public function add_control_rules( array $control, array $controls_stack, callable $value_callback, array $placeholders, array $replacements ) {
		$value = call_user_func( $value_callback, $control );

		if ( null === $value || empty( $control['selectors'] ) ) {
			return;
		}

		foreach ( $control['selectors'] as $selector => $css_property ) {
			try {
				$output_css_property = preg_replace_callback(
					'/\{\{(?:([^.}]+)\.)?([^}]*)}}/', function( $matches ) use ( $control, $value_callback, $controls_stack, $value, $css_property ) {
						$parser_control = $control;

						$value_to_insert = $value;

						if ( ! empty( $matches[1] ) ) {
							if ( ! isset( $controls_stack[ $matches[1] ] ) ) {
								return '';
							}

							$parser_control = $controls_stack[ $matches[1] ];

							$value_to_insert = call_user_func( $value_callback, $parser_control );
						}

						if ( Controls_Manager::FONT === $control['type'] ) {
							$this->fonts[] = $value_to_insert;
						}

						/** @var Base_Data_Control $control_obj */
						$control_obj = Plugin::$instance->controls_manager->get_control( $parser_control['type'] );

						$parsed_value = $control_obj->get_style_value( strtolower( $matches[2] ), $value_to_insert );

						if ( '' === $parsed_value ) {
							throw new \Exception();
						}

						return $parsed_value;
					}, $css_property
				);
			} catch ( \Exception $e ) {
				return;
			}

			if ( ! $output_css_property ) {
				continue;
			}

			$device_pattern = '/^(?:\([^\)]+\)){1,2}/';

			preg_match( $device_pattern, $selector, $device_rules );

			$query = [];

			if ( $device_rules ) {
				$selector = preg_replace( $device_pattern, '', $selector );

				preg_match_all( '/\(([^\)]+)\)/', $device_rules[0], $pure_device_rules );

				$pure_device_rules = $pure_device_rules[1];

				foreach ( $pure_device_rules as $device_rule ) {
					if ( Element_Base::RESPONSIVE_DESKTOP === $device_rule ) {
						continue;
					}

					$device = preg_replace( '/\+$/', '', $device_rule );

					$endpoint = $device === $device_rule ? 'max' : 'min';

					$query[ $endpoint ] = $device;
				}
			}

			$parsed_selector = str_replace( $placeholders, $replacements, $selector );

			if ( ! $query && ! empty( $control['responsive'] ) ) {
				$query = array_intersect_key( $control['responsive'], array_flip( [ 'min', 'max' ] ) );

				if ( ! empty( $query['max'] ) && Element_Base::RESPONSIVE_DESKTOP === $query['max'] ) {
					unset( $query['max'] );
				}
			}

			$this->stylesheet_obj->add_rules( $parsed_selector, $output_css_property, $query );
		}
	}

	/**
	 * @since 1.9.0
	 * @access public
	 */
	public function get_fonts() {
		return $this->fonts;
	}

	/**
	 * @since 1.2.0
	 * @access public
	 * @return string
	 */
	public function get_css() {
		if ( empty( $this->css ) ) {
			$this->parse_css();
		}

		return $this->css;
	}

	/**
	 * @since 1.2.0
	 * @access public
	 * @return Stylesheet
	 */
	public function get_stylesheet() {
		return $this->stylesheet_obj;
	}

	/**
	 * @since 1.2.0
	 * @access public
	*/
	public function get_meta( $property = null ) {
		$defaults = [
			'status' => '',
			'time' => 0,
		];

		$meta = array_merge( $defaults, (array) $this->load_meta() );

		if ( $property ) {
			return isset( $meta[ $property ] ) ? $meta[ $property ] : null;
		}

		return $meta;
	}

	/**
	 * @since 1.6.0
	 * @access public
	 * @param Controls_Stack $controls_stack
	 * @param array          $controls
	 * @param array          $values
	 * @param array          $placeholders
	 * @param array          $replacements
	 */
	public function add_controls_stack_style_rules( Controls_Stack $controls_stack, array $controls, array $values, array $placeholders, array $replacements ) {
		foreach ( $controls as $control ) {
			if ( ! empty( $control['style_fields'] ) ) {
				foreach ( $values[ $control['name'] ] as $field_value ) {
					$this->add_controls_stack_style_rules(
						$controls_stack,
						$control['style_fields'],
						$field_value,
						array_merge( $placeholders, [ '{{CURRENT_ITEM}}' ] ),
						array_merge( $replacements, [ '.elementor-repeater-item-' . $field_value['_id'] ] )
					);
				}
			}

			if ( empty( $control['selectors'] ) ) {
				continue;
			}

			$this->add_control_style_rules( $control, $values, $controls_stack->get_controls(), $placeholders, $replacements );
		}
	}

	/**
	 * @abstract
	 * @since 1.2.0
	 * @access protected
	 * @return array
	 */
	abstract protected function load_meta();

	/**
	 * @abstract
	 * @since 1.2.0
	 * @access protected
	 * @param array $meta
	 */
	abstract protected function update_meta( $meta );

	/**
	 * @abstract
	 * @since 1.2.0
	 * @access protected
	 * @return string
	 */
	abstract protected function get_file_handle_id();

	/**
	 * @abstract
	 * @since 1.2.0
	 * @access protected
	*/
	abstract protected function render_css();

	/**
	 * @abstract
	 * @since 1.2.0
	 * @access protected
	 * @return string
	 */
	abstract protected function get_file_name();

	/**
	 * @since 1.2.0
	 * @access protected
	 * @return array
	 */
	protected function get_enqueue_dependencies() {
		return [];
	}

	/**
	 * @since 1.2.0
	 * @access protected
	 * @return string
	 */
	protected function get_inline_dependency() {
		return '';
	}

	/**
	 * @since 1.2.0
	 * @access protected
	 * @return bool
	 */
	protected function is_update_required() {
		return false;
	}

	/**
	 * @since 1.2.0
	 * @access protected
	*/
	protected function parse_css() {
		$this->render_css();

		$name = $this->get_name();

		/**
		 * CSS file parse.
		 *
		 * Fires when CSS file is parsed on Elementor.
		 *
		 * The dynamic portion of the hook name, `$name`, refers to the CSS file name.
		 *
		 * @since 1.2.0
		 *
		 * @param CSS_File $this The current CSS file.
		 */
		do_action( "elementor/{$name}-css-file/parse", $this );

		$this->css = $this->stylesheet_obj->__toString();
	}

	/**
	 * @since 1.6.0
	 * @access private
	 * @param array $control
	 * @param array $values
	 * @param array $controls_stack
	 * @param array $placeholders
	 * @param array $replacements
	 */
	private function add_control_style_rules( array $control, array $values, array $controls_stack, array $placeholders, array $replacements ) {
		$this->add_control_rules(
			$control, $controls_stack, function( $control ) use ( $values ) {
				return $this->get_style_control_value( $control, $values );
			}, $placeholders, $replacements
		);
	}

	/**
	 * @since 1.6.0
	 * @access private
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
	 * @since 1.2.0
	 * @access private
	*/
	private function init_stylesheet() {
		$this->stylesheet_obj = new Stylesheet();

		$breakpoints = Responsive::get_breakpoints();

		$this->stylesheet_obj
			->add_device( 'mobile', 0 )
			->add_device( 'tablet', $breakpoints['md'] )
			->add_device( 'desktop', $breakpoints['lg'] );
	}

	/**
	 * @access protected
	 * @since 1.2.0
	*/
	protected function set_path_and_url() {
		$wp_upload_dir = wp_upload_dir( null, false );

		$relative_path = sprintf( self::FILE_NAME_PATTERN, self::FILE_BASE_DIR, $this->get_file_name() );

		$this->path = $wp_upload_dir['basedir'] . $relative_path;

		$this->url = set_url_scheme( $wp_upload_dir['baseurl'] . $relative_path );
	}
}
