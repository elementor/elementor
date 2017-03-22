<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Controls_Manager {

	const TAB_CONTENT = 'content';
	const TAB_STYLE = 'style';
	const TAB_ADVANCED = 'advanced';
	const TAB_RESPONSIVE = 'responsive';
	const TAB_LAYOUT = 'layout';
	const TAB_SETTINGS = 'settings';

	const TEXT = 'text';
	const NUMBER = 'number';
	const TEXTAREA = 'textarea';
	const SELECT = 'select';
	const CHECKBOX = 'checkbox';
	const SWITCHER = 'switcher';

	const HIDDEN = 'hidden';
	const HEADING = 'heading';
	const RAW_HTML = 'raw_html';
	const SECTION = 'section';
	const TAB = 'tab';
	const TABS = 'tabs';
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
	const DATE_TIME = 'date_time';
	const BOX_SHADOW = 'box_shadow';
	const ANIMATION = 'animation';
	const HOVER_ANIMATION = 'hover_animation';
	const ORDER = 'order';

	/**
	 * @var Control_Base[]
	 */
	private $_controls = null;

	/**
	 * @var Group_Control_Base[]
	 */
	private $_control_groups = [];

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
				self::TAB_SETTINGS => __( 'Settings', 'elementor' ),
			];

			self::$_available_tabs_controls = apply_filters( 'elementor/controls/get_available_tabs_controls', self::$_available_tabs_controls );
		}

		return self::$_available_tabs_controls;
	}

	/**
	 * @since 1.0.0
	 */
	public function register_controls() {
		$this->_controls = [];

		$available_controls = [
			self::TEXT,
			self::NUMBER,
			self::TEXTAREA,
			self::SELECT,
			self::CHECKBOX,
			self::SWITCHER,

			self::HIDDEN,
			self::HEADING,
			self::RAW_HTML,
			self::SECTION,
			self::TAB,
			self::TABS,
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
			self::DATE_TIME,
			self::BOX_SHADOW,
			self::ANIMATION,
			self::HOVER_ANIMATION,
			self::ORDER,
		];

		foreach ( $available_controls as $control_id ) {
			$control_filename = str_replace( '_', '-', $control_id );

			$control_filename = ELEMENTOR_PATH . "includes/controls/{$control_filename}.php";

			require( $control_filename );

			$class_name = __NAMESPACE__ . '\Control_' . ucwords( $control_id );

			$this->register_control( $control_id, new $class_name() );
		}

		// Group Controls
		require( ELEMENTOR_PATH . 'includes/controls/groups/background.php' );
		require( ELEMENTOR_PATH . 'includes/controls/groups/border.php' );
		require( ELEMENTOR_PATH . 'includes/controls/groups/typography.php' );
		require( ELEMENTOR_PATH . 'includes/controls/groups/image-size.php' );
		require( ELEMENTOR_PATH . 'includes/controls/groups/box-shadow.php' );

		$this->_control_groups['background'] = new Group_Control_Background();
		$this->_control_groups['border']     = new Group_Control_Border();
		$this->_control_groups['typography'] = new Group_Control_Typography();
		$this->_control_groups['image-size'] = new Group_Control_Image_Size();
		$this->_control_groups['box-shadow'] = new Group_Control_Box_Shadow();

		do_action( 'elementor/controls/controls_registered', $this );
	}

	/**
	 * @since 1.0.0
	 *
	 * @param $control_id
	 * @param Control_Base $control_instance
	 */
	public function register_control( $control_id, Control_Base $control_instance ) {
		$this->_controls[ $control_id ] = $control_instance;
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
		if ( null === $this->_controls ) {
			$this->register_controls();
		}

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
	 *
	 * @param string $id
	 *
	 * @return Group_Control_Base|Group_Control_Base[]
	 */
	public function get_control_groups( $id = null ) {
		if ( $id ) {
			return isset( $this->_control_groups[ $id ] ) ? $this->_control_groups[ $id ] : null;
		}

		return $this->_control_groups;
	}

	/**
	 * @since 1.0.0
	 *
	 * @param $id
	 * @param $instance
	 *
	 * @return Group_Control_Base[]
	 */
	public function add_group_control( $id, $instance ) {
		$this->_control_groups[ $id ] = $instance;

		return $instance;
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

	public function open_stack( Controls_Stack $element ) {
		$stack_id = $element->get_name();

		$this->_controls_stack[ $stack_id ] = [
			'tabs' => [],
			'controls' => [],
		];
	}

	public function add_control_to_stack( Controls_Stack $element, $control_id, $control_data, $overwrite = false ) {
		$default_args = [
			'type' => self::TEXT,
			'tab' => self::TAB_CONTENT,
		];

		$control_data['name'] = $control_id;

		$control_data = array_merge( $default_args, $control_data );

		$control_type_instance = $this->get_control( $control_data['type'] );

		if ( ! $control_type_instance ) {
			_doing_it_wrong( __CLASS__ . '::' . __FUNCTION__, 'Control type `' . $control_data['type'] . '` not found`', '1.0.0' );
			return false;
		}

		$control_default_value = $control_type_instance->get_default_value();

		if ( is_array( $control_default_value ) ) {
			$control_data['default'] = isset( $control_data['default'] ) ? array_merge( $control_default_value, $control_data['default'] ) : $control_default_value;
		} else {
			$control_data['default'] = isset( $control_data['default'] ) ? $control_data['default'] : $control_default_value;
		}

		$stack_id = $element->get_name();

		if ( ! $overwrite && isset( $this->_controls_stack[ $stack_id ]['controls'][ $control_id ] ) ) {
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

	public function remove_control_from_stack( $stack_id, $control_id ) {
		if ( is_array( $control_id ) ) {
			foreach ( $control_id as $id ) {
				$this->remove_control_from_stack( $stack_id, $id );
			}

			return true;
		}

		if ( empty( $this->_controls_stack[ $stack_id ]['controls'][ $control_id ] ) ) {
			return new \WP_Error( 'Cannot remove not-exists control.' );
		}

		unset( $this->_controls_stack[ $stack_id ]['controls'][ $control_id ] );

		return true;
	}

	/**
	 * @param string $stack_id
	 * @param string $control_id
	 *
	 * @return array|\WP_Error
	 */
	public function get_control_from_stack( $stack_id, $control_id ) {
		if ( empty( $this->_controls_stack[ $stack_id ]['controls'][ $control_id ] ) ) {
			return new \WP_Error( 'Cannot get a not-exists control.' );
		}

		return $this->_controls_stack[ $stack_id ]['controls'][ $control_id ];
	}

	public function update_control_in_stack( Controls_Stack $element, $control_id, $control_data ) {
		$old_control_data = $this->get_control_from_stack( $element->get_name(), $control_id );
		if ( is_wp_error( $old_control_data ) ) {
			return false;
		}

		$control_data = array_merge( $old_control_data, $control_data );

		return $this->add_control_to_stack( $element, $control_id, $control_data, true );
	}

	public function get_element_stack( Controls_Stack $element ) {
		$stack_id = $element->get_name();

		if ( ! isset( $this->_controls_stack[ $stack_id ] ) ) {
			return null;
		}

		$stack = $this->_controls_stack[ $stack_id ];

		if ( 'widget' === $element->get_type() && 'common' !== $stack_id ) {
			$common_widget = Plugin::$instance->widgets_manager->get_widget_types( 'common' );

			$stack['controls'] = array_merge( $stack['controls'], $common_widget->get_controls() );

			$stack['tabs'] = array_merge( $stack['tabs'], $common_widget->get_tabs_controls() );
		}

		return $stack;
	}

	/**
	 * @param $element Element_Base
	 */
	public function add_custom_css_controls( $element ) {
		$element->start_controls_section(
			'section_custom_css_pro',
			[
				'label' => __( 'Custom CSS', 'elementor' ),
				'tab'   => Controls_Manager::TAB_ADVANCED,
			]
		);

		$element->add_control(
			'custom_css_pro',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => '<div class="elementor-panel-nerd-box">
						<i class="elementor-panel-nerd-box-icon eicon-hypster"></i>
						<div class="elementor-panel-nerd-box-title">' .
							__( 'Meet Our Custom CSS', 'elementor' ) .
						'</div>
						<div class="elementor-panel-nerd-box-message">' .
							__( 'Custom CSS lets you add CSS code to any widget, and see it render live right in the editor.', 'elementor' ) .
						'</div>
						<div class="elementor-panel-nerd-box-message">' .
							__( 'This feature is only available on Elementor Pro.', 'elementor' ) .
						'</div>
						<a class="elementor-panel-nerd-box-link elementor-button elementor-button-default elementor-go-pro" href="https://go.elementor.com/pro-custom-css/" target="_blank">' .
							__( 'Go Pro', 'elementor' ) .
						'</a>
						</div>',
			]
		);

		$element->end_controls_section();
	}

	private function require_files() {
		// TODO: Move includes in later version (v1.2.x)
		require( ELEMENTOR_PATH . 'includes/controls/base.php' );
		require( ELEMENTOR_PATH . 'includes/controls/base-multiple.php' );
		require( ELEMENTOR_PATH . 'includes/controls/base-units.php' );

		// Group Controls
		require( ELEMENTOR_PATH . 'includes/interfaces/group-control.php' );
		require( ELEMENTOR_PATH . 'includes/controls/groups/base.php' );
	}

	public function __construct() {
		$this->require_files();
	}
}
