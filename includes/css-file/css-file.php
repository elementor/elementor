<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

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
	 * CSS_File constructor.
	 */
	public function __construct() {
		$this->set_path_and_url();

		$this->init_stylesheet();
	}

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
			wp_add_inline_style( $this->get_inline_dependency(), $meta['css'] );
		} else {
			wp_enqueue_style( $this->get_file_handle_id(), $this->url, $this->get_enqueue_dependencies(), $meta['time'] );
		}

		// Handle fonts
		if ( ! empty( $meta['fonts'] ) ) {
			foreach ( $meta['fonts'] as $font ) {
				Plugin::$instance->frontend->enqueue_font( $font );
			}
		}
	}

	/**
	 * @param array $control
	 * @param array $controls_stack
	 * @param callable $value_callback
	 * @param array $placeholders
	 * @param array $replacements
	 */
	public function add_control_rules( array $control, array $controls_stack, callable $value_callback, array $placeholders, array $replacements ) {
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

					if ( Controls_Manager::FONT === $control['type'] ) {
						$this->fonts[] = $value_to_insert;
					}

					$control_obj = Plugin::$instance->controls_manager->get_control( $parser_control['type'] );

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
				$query = $control['responsive'];

				if ( ! empty( $query['max'] ) && Element_Base::RESPONSIVE_DESKTOP === $query['max'] ) {
					unset( $query['max'] );
				}
			}

			$this->stylesheet_obj->add_rules( $parsed_selector, $output_css_property, $query );
		}
	}

	/**
	 * @return string
	 */
	public function get_css() {
		if ( empty( $this->css ) ) {
			$this->parse_css();
		}

		return $this->css;
	}

	/**
	 * @return Stylesheet
	 */
	public function get_stylesheet() {
		return $this->stylesheet_obj;
	}

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
	 * @return array
	 */
	abstract protected function load_meta();

	/**
	 * @param string $meta
	 */
	abstract protected function update_meta( $meta );

	/**
	 * @return string
	 */
	abstract protected function get_file_handle_id();

	abstract protected function render_css();

	/**
	 * @return string
	 */
	abstract protected function get_file_name();

	/**
	 * @return array
	 */
	protected function get_enqueue_dependencies() {
		return [];
	}

	/**
	 * @return string
	 */
	protected function get_inline_dependency() {
		return '';
	}

	/**
	 * @return bool
	 */
	protected function is_update_required() {
		return false;
	}

	private function init_stylesheet() {
		$this->stylesheet_obj = new Stylesheet();

		$breakpoints = Responsive::get_breakpoints();

		$this->stylesheet_obj
			->add_device( 'mobile', 0 )
			->add_device( 'tablet', $breakpoints['md'] )
			->add_device( 'desktop', $breakpoints['lg'] );
	}

	private function set_path_and_url() {
		$wp_upload_dir = wp_upload_dir( null, false );

		$relative_path = sprintf( self::FILE_NAME_PATTERN, self::FILE_BASE_DIR, $this->get_file_name() );

		$this->path = $wp_upload_dir['basedir'] . $relative_path;

		$this->url = set_url_scheme( $wp_upload_dir['baseurl'] . $relative_path );
	}

	private function parse_css() {
		$this->render_css();

		$this->css = $this->stylesheet_obj->__toString();
	}
}
