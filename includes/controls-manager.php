<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Controls_Manager {

	const TEXT = 'text';
	const NUMBER = 'number';
	const TEXTAREA = 'textarea';
	const SELECT = 'select';
	const CHECKBOX = 'checkbox';

	const HIDDEN = 'hidden';
	const HEADING = 'heading';
	const RAW_HTML = 'raw_html';
	const SECTION = 'section';
	const DIVIDER = 'divider';

	const COLOR = 'color';
	const MEDIA = 'media';
	const SLIDER = 'slider';
	const DIMENSIONS = 'dimensions';
	const CHOOSE = 'choose';
	const WYSIWYG = 'wysiwyg';
	const CODE = 'code';
	const FONT = 'font';
	const IMAGE_DIMENSIONS = 'image_dimensions';

	const WP_WIDGET = 'wp_widget';

	const URL = 'url';
	const REPEATER = 'repeater';
	const ICON = 'icon';
	const GALLERY = 'gallery';
	const STRUCTURE = 'structure';
	const SELECT2 = 'select2';
	const BOX_SHADOW = 'box_shadow';
	const ANIMATION = 'animation';
	const HOVER_ANIMATION = 'hover_animation';

	/**
	 * @var Control_Base[]
	 */
	private $_controls = [];

	/**
	 * @var Group_Control_Base[]
	 */
	private $_group_controls = [];

	/**
	 * @since 1.0.0
	 */
	public function register_controls() {
		include( 'controls/base.php' );
		include( 'controls/base-multiple.php' );
		include( 'controls/base-units.php' );

		$available_controls = [
			self::TEXT,
			self::NUMBER,
			self::TEXTAREA,
			self::SELECT,
			self::CHECKBOX,

			self::HIDDEN,
			self::HEADING,
			self::RAW_HTML,
			self::SECTION,
			self::DIVIDER,

			self::COLOR,
			self::MEDIA,
			self::SLIDER,
			self::DIMENSIONS,
			self::CHOOSE,
			self::WYSIWYG,
			self::CODE,
			self::FONT,
			self::IMAGE_DIMENSIONS,

			self::WP_WIDGET,

			self::URL,
			self::REPEATER,
			self::ICON,
			self::GALLERY,
			self::STRUCTURE,
			self::SELECT2,
			self::BOX_SHADOW,
			self::ANIMATION,
			self::HOVER_ANIMATION,
		];

		foreach ( $available_controls as $control_id ) {
			$control_filename = str_replace( '_', '-', $control_id );
			$control_filename = "controls/{$control_filename}.php";
			include( $control_filename );

			$class_name = __NAMESPACE__ . '\Control_' . ucwords( $control_id );
			$this->register_control( $control_id, $class_name );
		}

		// Group Controls
		include( ELEMENTOR_PATH . 'includes/interfaces/group-control.php' );
		include( 'controls/groups/base.php' );

		include( 'controls/groups/background.php' );
		include( 'controls/groups/border.php' );
		include( 'controls/groups/typography.php' );
		include( 'controls/groups/image-size.php' );
		include( 'controls/groups/box-shadow.php' );

		$this->_group_controls['background'] = new Group_Control_Background();
		$this->_group_controls['border'] = new Group_Control_Border();
		$this->_group_controls['typography'] = new Group_Control_Typography();
		$this->_group_controls['image-size'] = new Group_Control_Image_size();
		$this->_group_controls['box-shadow'] = new Group_Control_Box_Shadow();
	}

	/**
	 * @since 1.0.0
	 * @param $control_id
	 * @param $class_name
	 *
	 * @return bool|\WP_Error
	 */
	public function register_control( $control_id, $class_name ) {
		if ( ! class_exists( $class_name ) ) {
			return new \WP_Error( 'element_class_name_not_exists' );
		}
		$instance_control = new $class_name();

		if ( ! $instance_control instanceof Control_Base ) {
			return new \WP_Error( 'wrong_instance_control' );
		}
		$this->_controls[ $control_id ] = $instance_control;

		return true;
	}

	/**
	 * @param $control_id
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	public function unregister_control( $control_id ) {
		if ( ! isset( $this->_controls[ $control_id ] ) ) {
			return false;
		}
		unset( $this->_controls[ $control_id ] );
		return true;
	}

	/**
	 * @since 1.0.0
	 * @return Control_Base[]
	 */
	public function get_controls() {
		return $this->_controls;
	}

	/**
	 * @since 1.0.0
	 * @param $control_id
	 *
	 * @return bool|\Elementor\Control_Base
	 */
	public function get_control( $control_id ) {
		$controls = $this->get_controls();

		return isset( $controls[ $control_id ] ) ? $controls[ $control_id ] : false;
	}

	/**
	 * @since 1.0.0
	 * @return array
	 */
	public function get_controls_data() {
		$controls_data = [];

		foreach ( $this->get_controls() as $name => $control ) {
			$controls_data[ $name ] = $control->get_settings();
			$controls_data[ $name ]['default_value'] = $control->get_default_value();
		}

		return $controls_data;
	}

	/**
	 * @since 1.0.0
	 * @return void
	 */
	public function render_controls() {
		foreach ( $this->get_controls() as $control ) {
			$control->print_template();
		}
	}

	/**
	 * @since 1.0.0
	 * @return Group_Control_Base[]
	 */
	public function get_group_controls() {
		return $this->_group_controls;
	}

	/**
	 * @since 1.0.0
	 * @return void
	 */
	public function enqueue_control_scripts() {
		foreach ( $this->get_controls() as $control ) {
			$control->enqueue();
		}
	}

	/**
	 * Controls_Manager constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'init', [ $this, 'register_controls' ] );
	}
}
