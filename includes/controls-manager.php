<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Controls_Manager {

	const TAB_CONTENT = 'content';
	const TAB_STYLE = 'style';
	const TAB_ADVANCED = 'advanced';
	const TAB_RESPONSIVE = 'responsive';
	const TAB_LAYOUT = 'layout';

	const TEXT = 'text';
	const NUMBER = 'number';
	const TEXTAREA = 'textarea';
	const SELECT = 'select';
	const CHECKBOX = 'checkbox';
	const SWITCHER = 'switcher';
	const CHECKBOX_LIST = 'checkbox_list';

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
	const ORDER = 'order';

	/**
	 * @var Control_Base[]
	 */
	private $_controls = [];

	/**
	 * @var Group_Control_Base[]
	 */
	private $_group_controls = [];

	private $_controls_stack = [];

	private static $_available_tabs_controls;

	private static function _get_available_tabs_controls() {
		if ( ! self::$_available_tabs_controls ) {
			self::$_available_tabs_controls = [
				self::TAB_CONTENT => __( 'Content', 'elementor' ),
				self::TAB_STYLE => __( 'Style', 'elementor' ),
				self::TAB_ADVANCED => __( 'Advanced', 'elementor' ),
				self::TAB_RESPONSIVE => __( 'Responsive', 'elementor' ),
				self::TAB_LAYOUT => __( 'Layout', 'elementor' ),
			];

			self::$_available_tabs_controls = apply_filters( 'elementor/controls/get_available_tabs_controls', self::$_available_tabs_controls );
		}

		return self::$_available_tabs_controls;
	}

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
			self::SWITCHER,
			self::CHECKBOX_LIST,

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
			self::ORDER,
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
		$this->_group_controls['image-size'] = new Group_Control_Image_Size();
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

	public function open_stack( Element_Base $element ) {
		$stack_id = $element->get_name();

		$this->_controls_stack[ $stack_id ] = [
			'tabs' => [],
			'controls' => [],
		];
	}

	public function add_control_to_stack( Element_Base $element, $control_id, $control_data ) {
		$default_args = [
			'default' => '',
			'type' => self::TEXT,
			'tab' => self::TAB_CONTENT,
		];

		$control_data['name'] = $control_id;

		$control_data = array_merge( $default_args, $control_data );

		$stack_id = $element->get_name();

		if ( isset( $this->_controls_stack[ $stack_id ]['controls'][ $control_id ] ) ) {
			_doing_it_wrong( __CLASS__ . '::' . __FUNCTION__, 'Cannot redeclare control with same name. - ' . $control_id, '1.0.0' );
			return false;
		}

		$available_tabs = self::_get_available_tabs_controls();

		if ( ! isset( $available_tabs[ $control_data['tab'] ] ) ) {
			$control_data['tab'] = $default_args['tab'];
		}

		$this->_controls_stack[ $stack_id ]['tabs'][ $control_data['tab'] ] = $available_tabs[ $control_data['tab'] ];

		$this->_controls_stack[ $stack_id ]['controls'][ $control_id ] = $control_data;

		return true;
	}

	public function remove_control_from_stack( Element_Base $element, $control_id ) {
		$stack_id = $element->get_name();

		if ( empty( $this->_controls_stack[ $stack_id ][ $control_id ] ) ) {
			return new \WP_Error( 'Cannot remove not-exists control.' );
		}

		unset( $this->_controls_stack[ $stack_id ][ $control_id ] );

		return true;
	}

	public function get_element_stack( Element_Base $element ) {
		$stack_id = $element->get_name();

		if ( ! isset( $this->_controls_stack[ $stack_id ] ) ) {
			return null;
		}

		$stack = $this->_controls_stack[ $stack_id ];

		if ( 'widget' === $element->get_type() && 'common' !== $element->get_name() ) {
			$common_widget = Plugin::instance()->widgets_manager->get_widget_types( 'common' );

			$stack['controls'] = array_merge( $stack['controls'], $common_widget->get_controls() );

			$stack['tabs'] = array_merge( $stack['tabs'], $common_widget->get_tabs_controls() );
		}

		return $stack;
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
