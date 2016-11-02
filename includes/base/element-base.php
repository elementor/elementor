<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Element_Base {

	const RESPONSIVE_DESKTOP = 'desktop';
	const RESPONSIVE_TABLET = 'tablet';
	const RESPONSIVE_MOBILE = 'mobile';

	private $_id;

	private $_settings;

	private $_data;

	/**
	 * @var Element_Base[]
	 */
	private $_children;

	private $_render_attributes = [];

	private $_default_args = [];

	/**
	 * Holds the current section while render a set of controls sections
	 *
	 * @var null|array
	 */
	private $_current_section = null;

	public static function get_type() {
		return 'element';
	}

	/**
	 * @param array $element_data
	 *
	 * @return Element_Base
	 */
	abstract protected function _get_child_type( array $element_data );

	abstract public function get_name();

	public function __construct( $data = [], $args = [] ) {
		if ( $data ) {
			$this->_init( $data );
		} else {
			$this->_default_args = $args;
		}
	}

	public final function get_controls( $control_id = null ) {
		$stack = Plugin::instance()->controls_manager->get_element_stack( $this );

		if ( null === $stack ) {
			$this->_init_controls();

			return $this->get_controls();
		}

		if ( $control_id ) {
			return isset( $stack['controls'][ $control_id ] ) ? $stack['controls'][ $control_id ] : null;
		}

		return $stack['controls'];
	}

	public final function add_control( $id, $args ) {
		if ( empty( $args['type'] ) || ! in_array( $args['type'], [ Controls_Manager::SECTION, Controls_Manager::WP_WIDGET ] ) ) {
			if ( null !== $this->_current_section ) {
				if ( ! empty( $args['section'] ) || ! empty( $args['tab'] ) ) {
					_doing_it_wrong( __CLASS__ . '::' . __FUNCTION__, 'Cannot redeclare control with `tab` or `section` args inside section. - ' . $id, '1.0.0' );
				}
				$args = array_merge( $args, $this->_current_section );
			} elseif ( empty( $args['section'] ) ) {
				wp_die( __CLASS__ . '::' . __FUNCTION__ . ': Cannot add a control outside a section (use `start_controls_section`).' );
			}
		}

		return Plugin::instance()->controls_manager->add_control_to_stack( $this, $id, $args );
	}

	public function remove_control( $id ) {
		return Plugin::instance()->controls_manager->remove_control_from_stack( $this, $id );
	}

	public final function add_group_control( $group_name, $args = [] ) {
		do_action_ref_array( 'elementor/elements/add_group_control/' . $group_name, [ $this, $args ] );
	}

	public final function get_tabs_controls() {
		$stack = Plugin::instance()->controls_manager->get_element_stack( $this );

		return $stack['tabs'];
	}

	public final function get_scheme_controls() {
		$enabled_schemes = Schemes_Manager::get_enabled_schemes();

		return array_filter( $this->get_controls(), function( $control ) use ( $enabled_schemes ) {
			return ( ! empty( $control['scheme'] ) && in_array( $control['scheme']['type'], $enabled_schemes ) );
		} );
	}

	public final function get_style_controls() {
		return array_filter( $this->get_controls(), function( $control ) {
			return ( ! empty( $control['selectors'] ) );
		} );
	}

	public final function get_class_controls() {
		return array_filter( $this->get_controls(), function( $control ) {
			return ( isset( $control['prefix_class'] ) );
		} );
	}

	public final function add_responsive_control( $id, $args = [] ) {
		// Desktop
		$control_args = $args;

		if ( ! empty( $args['prefix_class'] ) ) {
			$control_args['prefix_class'] = sprintf( $args['prefix_class'], '' );
		}

		$control_args['responsive'] = self::RESPONSIVE_DESKTOP;

		$this->add_control(
			$id,
			$control_args
		);

		// Tablet
		$control_args = $args;

		if ( ! empty( $args['prefix_class'] ) ) {
			$control_args['prefix_class'] = sprintf( $args['prefix_class'], '-' . self::RESPONSIVE_TABLET );
		}

		$control_args['responsive'] = self::RESPONSIVE_TABLET;

		$this->add_control(
			$id . '_tablet',
			$control_args
		);

		// Mobile
		$control_args = $args;

		if ( ! empty( $args['prefix_class'] ) ) {
			$control_args['prefix_class'] = sprintf( $args['prefix_class'], '-' . self::RESPONSIVE_MOBILE );
		}

		$control_args['responsive'] = self::RESPONSIVE_MOBILE;

		$this->add_control(
			$id . '_mobile',
			$control_args
		);
	}

	public final function get_class_name() {
		return get_called_class();
	}

	public function before_render() {}

	public function after_render() {}

	public function get_title() {
		return '';
	}

	public function get_keywords() {
		return '';
	}

	public function get_categories() {
		return [ 'basic' ];
	}

	public function get_icon() {
		return 'columns';
	}

	public function is_reload_preview_required() {
		return false;
	}

	public function get_config( $item = null ) {
		$config = [
			'name' => $this->get_name(),
			'elType' => $this->get_type(),
			'title' => $this->get_title(),
			'controls' => array_values( $this->get_controls() ),
			'tabs_controls' => $this->get_tabs_controls(),
			'categories' => $this->get_categories(),
			'keywords' => $this->get_keywords(),
			'icon' => $this->get_icon(),
			'reload_preview' => $this->is_reload_preview_required(),
		];

		if ( $item ) {
			return isset( $config[ $item ] ) ? $config[ $item ] : null;
		}

		return $config;
	}

	public function print_template() {
		ob_start();

		$this->_content_template();

		$content_template = apply_filters( 'elementor/elements/print_template', ob_get_clean(),  $this );

		if ( empty( $content_template ) ) {
			return;
		}
		?>
		<script type="text/html" id="tmpl-elementor-<?php echo $this->get_type(); ?>-<?php echo esc_attr( $this->get_name() ); ?>-content">
			<?php $this->_render_settings(); ?>
			<?php echo $content_template; ?>
		</script>
		<?php
	}

	public function get_id() {
		return $this->_id;
	}

	public function get_data( $item = null ) {
		if ( $item ) {
			return isset( $this->_data[ $item ] ) ? $this->_data[ $item ] : null;
		}

		return $this->_data;
	}

	public function get_settings( $setting = null ) {
		if ( $setting ) {
			return isset( $this->_settings[ $setting ] ) ? $this->_settings[ $setting ] : null;
		}

		return $this->_settings;
	}

	public function get_children() {
		if ( null === $this->_children ) {
			$this->_init_children();
		}

		return $this->_children;
	}

	public function get_default_args() {
		return $this->_default_args;
	}

	/**
	 * @return Element_Base
	 */
	public function get_parent() {
		return $this->get_data( 'parent' );
	}

	/**
	 * @param array $child_data
	 * @param array $child_args
	 *
	 * @return Element_Base|false
	 */
	public function add_child( array $child_data, array $child_args = [] ) {
		if ( null === $this->_children ) {
			$this->_init_children();
		}

		$child_type = $this->_get_child_type( $child_data );

		if ( ! $child_type ) {
			return false;
		}

		$child_args = array_merge( $child_type->get_default_args(), $child_args );

		$child_class = $child_type->get_class_name();

		$child = new $child_class( $child_data, $child_args );

		$this->_children[] = $child;

		return $child;
	}

	public function is_control_visible( $control ) {
		if ( empty( $control['condition'] ) ) {
			return true;
		}

		foreach ( $control['condition'] as $condition_key => $condition_value ) {
			preg_match( '/([a-z_0-9]+)(?:\[([a-z_]+)])?(!?)$/i', $condition_key, $condition_key_parts );

			$pure_condition_key = $condition_key_parts[1];
			$condition_sub_key = $condition_key_parts[2];
			$is_negative_condition = ! ! $condition_key_parts[3];

			$instance_value = $this->get_settings( $pure_condition_key );

			if ( null === $instance_value ) {
				return false;
			}

			if ( $condition_sub_key ) {
				if ( ! isset( $instance_value[ $condition_sub_key ] ) ) {
					return false;
				}

				$instance_value = $instance_value[ $condition_sub_key ];
			}

			$is_contains = is_array( $condition_value ) ? in_array( $instance_value, $condition_value ) : $instance_value === $condition_value;

			if ( $is_negative_condition && $is_contains || ! $is_negative_condition && ! $is_contains ) {
				return false;
			}
		}

		return true;
	}

	public function add_render_attribute( $element, $key = null, $value = null ) {
		if ( is_array( $element ) ) {
			foreach ( $element as $element_key => $attributes ) {
				$this->add_render_attribute( $element_key, $attributes );
			}

			return $this;
		}

		if ( is_array( $key ) ) {
			foreach ( $key as $attribute_key => $attributes ) {
				$this->add_render_attribute( $element, $attribute_key, $attributes );
			}

			return $this;
		}

		if ( empty( $this->_render_attributes[ $element ][ $key ] ) ) {
			$this->_render_attributes[ $element ][ $key ] = [];
		}

		$this->_render_attributes[ $element ][ $key ] = array_merge( $this->_render_attributes[ $element ][ $key ], (array) $value );

		return $this;
	}

	public function get_render_attribute_string( $element ) {
		if ( empty( $this->_render_attributes[ $element ] ) ) {
			return '';
		}

		$render_attributes = $this->_render_attributes[ $element ];

		$attributes = [];

		foreach ( $render_attributes as $attribute_key => $attribute_values ) {
			$attributes[] = sprintf( '%s="%s"', $attribute_key, esc_attr( implode( ' ', $attribute_values ) ) );
		}

		return implode( ' ', $attributes );
	}

	public function print_element() {
		do_action( 'elementor/frontend/' . static::get_type() . '/before_render', $this );

		$this->before_render();

		$this->_print_content();

		$this->after_render();

		do_action( 'elementor/frontend/' . static::get_type() . '/after_render', $this );
	}

	public function get_raw_data( $with_html_content = false ) {
		$data = $this->get_data();

		$elements = [];

		foreach ( $this->get_children() as $child ) {
			$elements[] = $child->get_raw_data( $with_html_content );
		}

		return [
			'id' => $this->_id,
			'elType' => $data['elType'],
			'settings' => $data['settings'],
			'elements' => $elements,
			'isInner' => $data['isInner'],
		];
	}

	public function start_controls_section( $id, $args ) {
		do_action( 'elementor/element/before_section_start', $this, $id, $args );

		$args['type'] = Controls_Manager::SECTION;

		$this->add_control( $id, $args );

		if ( null !== $this->_current_section ) {
			wp_die( sprintf( 'Elementor: You can\'t start a section before the end of the previous section: `%s`', $this->_current_section['section'] ) );
		}

		$this->_current_section = [
			'section' => $id,
			'tab' => $this->get_controls( $id )['tab'],
		];

		do_action( 'elementor/element/after_section_start', $this, $id, $args );
	}

	public function end_controls_section() {
		// Save the current section for the action
		$current_section = $this->_current_section;

		$this->_current_section = null;

		do_action( 'elementor/element/after_section_end', $this, $current_section['section'], [ 'tab' => $current_section['tab'] ] );
	}

	protected function _register_controls() {}

	protected function _content_template() {}

	protected function _render_settings() {
		?>
		<div class="elementor-element-overlay">
			<div class="elementor-editor-element-settings elementor-editor-<?php echo esc_attr( $this->get_type() ); ?>-settings elementor-editor-<?php echo esc_attr( $this->get_name() ); ?>-settings">
				<ul class="elementor-editor-element-settings-list">
					<li class="elementor-editor-element-setting elementor-editor-element-add">
						<a href="#" title="<?php _e( 'Add Widget', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Add', 'elementor' ); ?></span>
							<i class="fa fa-plus"></i>
						</a>
					</li>
					<?php /* Temp removing for better UI
					<li class="elementor-editor-element-setting elementor-editor-element-edit">
						<a href="#" title="<?php _e( 'Edit Widget', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Edit', 'elementor' ); ?></span>
							<i class="fa fa-pencil"></i>
						</a>
					</li>
					*/ ?>
					<li class="elementor-editor-element-setting elementor-editor-element-duplicate">
						<a href="#" title="<?php _e( 'Duplicate Widget', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Duplicate', 'elementor' ); ?></span>
							<i class="fa fa-files-o"></i>
						</a>
					</li>
					<li class="elementor-editor-element-setting elementor-editor-element-remove">
						<a href="#" title="<?php _e( 'Remove Widget', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Remove', 'elementor' ); ?></span>
							<i class="fa fa-trash-o"></i>
						</a>
					</li>
				</ul>
			</div>
		</div>
		<?php
	}

	protected function render() {}

	protected function get_default_data() {
		return [
			'id' => 0,
			'settings' => [],
			'elements' => [],
			'isInner' => false,
		];
	}

	protected function _get_parsed_settings() {
		$settings = $this->_data['settings'];

		foreach ( $this->get_controls() as $control ) {
			$control_obj = Plugin::instance()->controls_manager->get_control( $control['type'] );

			$settings[ $control['name'] ] = $control_obj->get_value( $control, $settings );
		}

		return $settings;
	}

	protected function _print_content() {
		foreach ( $this->get_children() as $child ) {
			$child->print_element();
		}
	}

	private function _init_controls() {
		Plugin::instance()->controls_manager->open_stack( $this );

		$this->_register_controls();
	}

	private function _init_children() {
		$this->_children = [];

		$children_data = $this->get_data( 'elements' );

		if ( ! $children_data ) {
			return;
		}

		foreach ( $children_data as $child_data ) {
			$this->add_child( $child_data );
		}
	}

	private function _init( $data ) {
		$this->_data = array_merge( $this->get_default_data(), $data );
		$this->_id = $data['id'];
		$this->_settings = $this->_get_parsed_settings();
	}
}
