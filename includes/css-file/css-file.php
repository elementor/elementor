<?php
namespace Elementor;

use Elementor\Core\DynamicTags\Manager;
use Elementor\Core\DynamicTags\Tag;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor CSS file.
 *
 * Elementor CSS file handler class is responsible for generating CSS files.
 *
 * @since 1.2.0
 * @abstract
 */
abstract class CSS_File {

	/**
	 * Elementor CSS files base folder.
	 *
	 * Relative folder in the WordPress uploads folder.
	 */
	const FILE_BASE_DIR = '/elementor/css';

	/**
	 * Elementor CSS file name pattern.
	 *
	 * %s: Base folder; %s: file name
	 */
	const FILE_NAME_PATTERN = '%s/%s.css';

	/**
	 * Elementor CSS file generated status.
	 *
	 * The parsing result after generating CSS file.
	 */
	const CSS_STATUS_FILE = 'file';

	/**
	 * Elementor inline CSS status.
	 *
	 * The parsing result after generating inline CSS.
	 */
	const CSS_STATUS_INLINE = 'inline';

	/**
	 * Elementor CSS empty status.
	 *
	 * The parsing result when an empty CSS returned.
	 */
	const CSS_STATUS_EMPTY = 'empty';

	/**
	 * CSS file path.
	 *
	 * Holds the CSS file path.
	 *
	 * @access private
	 *
	 * @var string
	 */
	private $path;

	/**
	 * CSS file URL.
	 *
	 * Holds the CSS file URL.
	 *
	 * @access private
	 *
	 * @var string
	 */
	private $url;

	/**
	 * CSS.
	 *
	 * Holds the CSS.
	 *
	 * @access private
	 *
	 * @var string
	 */
	private $css;

	/**
	 * Fonts.
	 *
	 * Holds the list of fonts.
	 *
	 * @access private
	 *
	 * @var array
	 */
	private $fonts = [];

	/**
	 * Stylesheet object.
	 *
	 * Holds the CSS file stylesheet instance.
	 *
	 * @access protected
	 *
	 * @var Stylesheet
	 */
	protected $stylesheet_obj;

	/**
	 * Printed.
	 *
	 * Holds the list of printed files.
	 *
	 * @access protected
	 *
	 * @var array
	 */
	private static $printed = [];

	/**
	 * Get CSS file name.
	 *
	 * Retrieve the CSS file name.
	 *
	 * @since 1.6.0
	 * @access public
	 * @abstract
	 */
	abstract public function get_name();

	/**
	 * CSS file constructor.
	 *
	 * Initializing Elementor CSS file. If using external files, set path and
	 * URL, otherwise initiate stylesheet.
	 *
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
	 * Use external file.
	 *
	 * Whether to use external CSS file of not. When there are new schemes or settings
	 * updates.
	 *
	 * @since 1.9.0
	 * @access protected
	 *
	 * @return bool True if the CSS requires an update, False otherwise.
	 */
	protected function use_external_file() {
		return 'internal' !== get_option( 'elementor_css_print_method' );
	}

	/**
	 * Update the CSS file.
	 *
	 * Delete old CSS, parse the CSS, save the new file and update the database.
	 *
	 * This method also sets the CSS status to be used later on in the render posses.
	 *
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
	 * Delete the CSS file.
	 *
	 * If the CSS file exist, delete it.
	 *
	 * @since 1.2.0
	 * @access public
	 */
	public function delete() {
		if ( file_exists( $this->path ) ) {
			unlink( $this->path );
		}
	}

	/**
	 * Enqueue CSS.
	 *
	 * Either enqueue the CSS file in Elementor or add inline style.
	 *
	 * This method is also responsible for loading the fonts.
	 *
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
				printf( '<style id="%1$s">%2$s</style>', $this->get_file_handle_id(), $meta['css'] ); // XSS ok.
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
		 * Enqueue CSS file.
		 *
		 * Fires when CSS file is enqueued on Elementor.
		 *
		 * The dynamic portion of the hook name, `$name`, refers to the CSS file name.
		 *
		 * @since 1.9.0
		 * @deprecated 2.0.0 Use `elementor/css-file/{$name}/enqueue` action instead.
		 * @todo Need to be hard deprecated using `do_action_deprecated()`.
		 *
		 * @param CSS_File $this The current CSS file.
		 */
		do_action( "elementor/{$name}-css-file/enqueue", $this );

		/**
		 * Enqueue CSS file.
		 *
		 * Fires when CSS file is enqueued on Elementor.
		 *
		 * The dynamic portion of the hook name, `$name`, refers to the CSS file name.
		 *
		 * @since 2.0.0
		 *
		 * @param CSS_File $this The current CSS file.
		 */
		do_action( "elementor/css-file/{$name}/enqueue", $this );
	}

	/**
	 * Print CSS.
	 *
	 * Output the final CSS inside the `<style>` tags and all the frontend fonts in
	 * use.
	 *
	 * @since 1.9.4
	 * @access public
	 */
	public function print_css() {
		echo '<style>' . $this->get_css() . '</style>'; // XSS ok.
		Plugin::$instance->frontend->print_fonts_links();
	}

	/**
	 * Add control rules.
	 *
	 * Parse the CSS for all the elements inside any given control.
	 *
	 * This method recursively renders the CSS for all the selectors in the control.
	 *
	 * @since 1.2.0
	 * @access public
	 *
	 * @param array    $control        The controls.
	 * @param array    $controls_stack The controls stack.
	 * @param callable $value_callback Callback function for the value.
	 * @param array    $placeholders   Placeholders.
	 * @param array    $replacements   Replacements.
	 *
	 * @throws \Exception If no parsed value.
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
	 * Get the fonts.
	 *
	 * Retrieve the list of fonts.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @return array Fonts.
	 */
	public function get_fonts() {
		return $this->fonts;
	}

	/**
	 * Get CSS.
	 *
	 * Retrieve the CSS. If the CSS is empty, parse it again.
	 *
	 * @since 1.2.0
	 * @access public
	 *
	 * @return string The CSS.
	 */
	public function get_css() {
		if ( empty( $this->css ) ) {
			$this->parse_css();
		}

		return $this->css;
	}

	/**
	 * Get stylesheet.
	 *
	 * Retrieve the CSS file stylesheet instance.
	 *
	 * @since 1.2.0
	 * @access public
	 *
	 * @return Stylesheet The stylesheet object.
	 */
	public function get_stylesheet() {
		return $this->stylesheet_obj;
	}

	/**
	 * Get meta data.
	 *
	 * Retrieve the CSS file meta data. Returns an array of all the data, or if
	 * custom property is given it will return the property value, or `null` if
	 * the property does not exist.
	 *
	 * @since 1.2.0
	 * @access public
	 *
	 * @param string $property Optional. Custom meta data property. Default is
	 *                         null.
	 *
	 * @return array|null An array of all the data, or if custom property is
	 *                    given it will return the property value, or `null` if
	 *                    the property does not exist.
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
	 * Add controls stack style rules.
	 *
	 * Parse the CSS for all the elements inside any given controls stack.
	 *
	 * This method recursively renders the CSS for all the child elements in the stack.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @param Controls_Stack $controls_stack The controls stack.
	 * @param array          $controls       Controls array.
	 * @param array          $values         Values array.
	 * @param array          $placeholders   Placeholders.
	 * @param array          $replacements   Replacements.
	 */
	public function add_controls_stack_style_rules( Controls_Stack $controls_stack, array $controls, array $values, array $placeholders, array $replacements ) {
		$all_controls = $controls_stack->get_controls();

		$parsed_dynamic_settings = $controls_stack->parse_dynamic_settings( $values, $controls );

		foreach ( $controls as $control ) {
			if ( ! empty( $control['style_fields'] ) ) {
				$this->add_repeater_control_style_rules( $controls_stack, $control['style_fields'], $values[ $control['name'] ], $placeholders, $replacements );
			}

			if ( ! empty( $control[ Manager::DYNAMIC_SETTING_KEY ][ $control['name'] ] ) ) {
				$this->add_dynamic_control_style_rules( $control, $control[ Manager::DYNAMIC_SETTING_KEY ][ $control['name'] ] );
			}

			if ( ! empty( $parsed_dynamic_settings[ Manager::DYNAMIC_SETTING_KEY ][ $control['name'] ] ) ) {
				unset( $parsed_dynamic_settings[ $control['name'] ] );
				continue;
			}

			if ( empty( $control['selectors'] ) ) {
				continue;
			}

			$this->add_control_style_rules( $control, $parsed_dynamic_settings, $all_controls, $placeholders, $replacements );
		}
	}

	/**
	 * Load meta data.
	 *
	 * Retrieve the CSS file meta data.
	 *
	 * @since 1.2.0
	 * @access protected
	 * @abstract
	 */
	abstract protected function load_meta();

	/**
	 * Update meta data.
	 *
	 * Update the global CSS file meta data.
	 *
	 * @since 1.2.0
	 * @access protected
	 * @abstract
	 *
	 * @param array $meta New meta data.
	 */
	abstract protected function update_meta( $meta );

	/**
	 * Get file handle ID.
	 *
	 * Retrieve the file handle ID.
	 *
	 * @since 1.2.0
	 * @access protected
	 * @abstract
	 *
	 * @return string CSS file handle ID.
	 */
	abstract protected function get_file_handle_id();

	/**
	 * Render CSS.
	 *
	 * Parse the CSS.
	 *
	 * @since 1.2.0
	 * @access protected
	 * @abstract
	 */
	abstract protected function render_css();

	/**
	 * Get file name.
	 *
	 * Retrieve the name of the CSS file.
	 *
	 * @since 1.2.0
	 * @access protected
	 * @abstract
	 *
	 * @return string File name.
	 */
	abstract protected function get_file_name();

	/**
	 * Get enqueue dependencies.
	 *
	 * Retrieve the name of the stylesheet used by `wp_enqueue_style()`.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return array Name of the stylesheet.
	 */
	protected function get_enqueue_dependencies() {
		return [];
	}

	/**
	 * Get inline dependency.
	 *
	 * Retrieve the name of the stylesheet used by `wp_add_inline_style()`.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return string Name of the stylesheet.
	 */
	protected function get_inline_dependency() {
		return '';
	}

	/**
	 * Is update required.
	 *
	 * Whether the CSS requires an update. When there are new schemes or settings
	 * updates.
	 *
	 * @since 1.2.0
	 * @access protected
	 *
	 * @return bool True if the CSS requires an update, False otherwise.
	 */
	protected function is_update_required() {
		return false;
	}

	/**
	 * Parse CSS.
	 *
	 * Parsing the CSS file.
	 *
	 * @since 1.2.0
	 * @access protected
	 */
	protected function parse_css() {
		$this->render_css();

		$name = $this->get_name();

		/**
		 * Parse CSS file.
		 *
		 * Fires when CSS file is parsed on Elementor.
		 *
		 * The dynamic portion of the hook name, `$name`, refers to the CSS file name.
		 *
		 * @since 1.2.0
		 * @deprecated 2.0.0 Use `elementor/css-file/{$name}/parse` action instead.
		 * @todo Need to be hard deprecated using `do_action_deprecated()`.
		 *
		 * @param CSS_File $this The current CSS file.
		 */
		do_action( "elementor/{$name}-css-file/parse", $this );

		/**
		 * Parse CSS file.
		 *
		 * Fires when CSS file is parsed on Elementor.
		 *
		 * The dynamic portion of the hook name, `$name`, refers to the CSS file name.
		 *
		 * @since 2.0.0
		 *
		 * @param CSS_File $this The current CSS file.
		 */
		do_action( "elementor/css-file/{$name}/parse", $this );

		$this->css = $this->stylesheet_obj->__toString();
	}

	/**
	 * Set path and URL.
	 *
	 * Define the CSS file path and file URL.
	 *
	 * @since 1.2.0
	 * @access protected
	 */
	protected function set_path_and_url() {
		$wp_upload_dir = wp_upload_dir( null, false );

		$relative_path = sprintf( self::FILE_NAME_PATTERN, self::FILE_BASE_DIR, $this->get_file_name() );

		$this->path = $wp_upload_dir['basedir'] . $relative_path;
		$this->url = set_url_scheme( $wp_upload_dir['baseurl'] . $relative_path );
	}

	/**
	 * Add control style rules.
	 *
	 * Register new style rules for the control.
	 *
	 * @since 1.6.0
	 * @access private
	 *
	 * @param array $control      The control.
	 * @param array $values       Values array.
	 * @param array $controls     The controls stack.
	 * @param array $placeholders Placeholders.
	 * @param array $replacements Replacements.
	 */
	protected function add_control_style_rules( array $control, array $values, array $controls, array $placeholders, array $replacements ) {
		$this->add_control_rules(
			$control, $controls, function( $control ) use ( $values ) {

				return $this->get_style_control_value( $control, $values );
			}, $placeholders, $replacements
		);
	}

	/**
	 * Get style control value.
	 *
	 * Retrieve the value of the style control for any give control and values.
	 *
	 * It will retrieve the control name and return the style value.
	 *
	 * @since 1.6.0
	 * @access private
	 *
	 * @param array $control The control.
	 * @param array $values  Values array.
	 *
	 * @return mixed Style control value.
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
	 * Init stylesheet.
	 *
	 * Initialize CSS file stylesheet by creating a new `Stylesheet` object and register new
	 * breakpoints for the stylesheet.
	 *
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
	 * Add repeater control style rules.
	 *
	 * Register new style rules for the repeater control.
	 *
	 * @since 2.0.0
	 * @access private
	 *
	 * @param Controls_Stack $controls_stack          The control stack.
	 * @param array          $repeater_controls_items The repeater controls items.
	 * @param array          $repeater_values         Repeater values array.
	 * @param array          $placeholders            Placeholders.
	 * @param array          $replacements            Replacements.
	 */
	protected function add_repeater_control_style_rules( Controls_Stack $controls_stack, array $repeater_controls_items, array $repeater_values, array $placeholders, array $replacements ) {
		$placeholders = array_merge( $placeholders, [ '{{CURRENT_ITEM}}' ] );

		foreach ( $repeater_controls_items as $index => $item ) {
			$this->add_controls_stack_style_rules(
				$controls_stack,
				$item,
				$repeater_values[ $index ],
				$placeholders,
				array_merge( $replacements, [ '.elementor-repeater-item-' . $repeater_values[ $index ]['_id'] ] )
			);
		}
	}

	/**
	 * Add dynamic control style rules.
	 *
	 * Register new style rules for the dynamic control.
	 *
	 * @since 2.0.0
	 * @access private
	 *
	 * @param array  $control The control.
	 * @param string $value   The value.
	 */
	protected function add_dynamic_control_style_rules( array $control, $value ) {
		Plugin::$instance->dynamic_tags->parse_tags_text( $value, $control, function( $id, $name, $settings ) {
			$tag = Plugin::$instance->dynamic_tags->create_tag( $id, $name, $settings );

			if ( ! $tag instanceof Tag ) {
				return;
			}

			$this->add_controls_stack_style_rules( $tag, $tag->get_style_controls(), $tag->get_active_settings(), [ '{{WRAPPER}}' ], [ '#elementor-tag-' . $id ] );
		} );
	}
}
