<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Widget Base
 *
 * Base class extended to register Elementor widgets.
 *
 * This class must be extended for each widget.
 *
 * @abstract
 */
abstract class Widget_Base extends Element_Base {

	/**
	 * Whether a template has content.
	 *
	 * Default is true, widget templates has content.
	 *
	 * @access protected
	 *
	 * @var bool
	 */
	protected $_has_template_content = true;

	/**
	 * Retrieve control type.
	 *
	 * Get the element type, in this case `widget`.
	 *
	 * @access public
	 * @static
	 *
	 * @return string Control type.
	 */
	public static function get_type() {
		return 'widget';
	}

	/**
	 * Retrieve default edit tools.
	 *
	 * ?????
	 *
	 * @access protected
	 * @static
	 *
	 * @return array Default edit tools.
	 */
	protected static function get_default_edit_tools() {
		$widget_label = __( 'Widget', 'elementor' );

		return [
			'duplicate' => [
				'title' => sprintf( __( 'Duplicate %s', 'elementor' ), $widget_label ),
				'icon' => 'clone',
			],
			'remove' => [
				'title' => sprintf( __( 'Remove %s', 'elementor' ), $widget_label ),
				'icon' => 'close',
			],
		];
	}

	/**
	 * Retrieve widget icon.
	 *
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-apps';
	}

	/**
	 * Retrieve widget keywords.
	 *
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return [];
	}

	/**
	 * Retrieve widget categories.
	 *
	 * @access public
	 *
	 * @return array Widget categories.
	 */
	public function get_categories() {
		return [ 'basic' ];
	}

	/**
	 * Widget base constructor.
	 *
	 * Initializing the widget base class.
	 *
	 * @access public
	 *
	 * @param array      $data Widget data. Default is an empty array.
	 * @param array|null $args Optional. Widget arguments. Default is null.
	 */
	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );

		$is_type_instance = $this->is_type_instance();

		if ( ! $is_type_instance && null === $args ) {
			throw new \Exception( '`$args` argument is required when initializing a full widget instance' );
		}

		if ( $is_type_instance ) {
			$this->_register_skins();

			do_action( 'elementor/widget/' . $this->get_name() . '/skins_init', $this );
		}
	}

	/**
	 * Show in panel.
	 *
	 * Whether to show the widget in the panel or not. By default returns true.
	 *
	 * @access public
	 *
	 * @return bool Whether to show the widget in the panel or not.
	 */
	public function show_in_panel() {
		return true;
	}

	/**
	 * Start widget controls section.
	 *
	 * Used to add a new section of controls to the widget. Regular controls and
	 * skin controls.
	 *
	 * @access public
	 *
	 * @param string $section_id Section ID.
	 * @param array  $args       Section arguments.
	 */
	public function start_controls_section( $section_id, array $args ) {
		parent::start_controls_section( $section_id, $args );

		static $is_first_section = true;

		if ( $is_first_section ) {
			$this->_register_skin_control();

			$is_first_section = false;
		}
	}

	/**
	 * Register widget skin control.
	 *
	 * Used to add a new skin controls to the widget. Added at the top of the
	 * controls section.
	 *
	 * @access private
	 */
	private function _register_skin_control() {
		$skins = $this->get_skins();
		if ( ! empty( $skins ) ) {
			$skin_options = [];

			if ( $this->_has_template_content ) {
				$skin_options[''] = __( 'Default', 'elementor' );
			}

			foreach ( $skins as $skin_id => $skin ) {
				$skin_options[ $skin_id ] = $skin->get_title();
			}

			// Get the first item for default value
			$default_value = array_keys( $skin_options );
			$default_value = array_shift( $default_value );

			if ( 1 >= sizeof( $skin_options ) ) {
				$this->add_control(
					'_skin',
					[
						'label' => __( 'Skin', 'elementor' ),
						'type' => Controls_Manager::HIDDEN,
						'default' => $default_value,
					]
				);
			} else {
				$this->add_control(
					'_skin',
					[
						'label' => __( 'Skin', 'elementor' ),
						'type' => Controls_Manager::SELECT,
						'default' => $default_value,
						'options' => $skin_options,
					]
				);
			}
		}
	}

	/**
	 * Register skin control.
	 *
	 * Used to assign skins to the widgets with `add_skin()` method. This method
	 * activated while initializing the widget base class.
	 *
	 * @access protected
	 */
	protected function _register_skins() {}

	/**
	 * Retrieve initial config.
	 *
	 * Get the initial widget configuration.
	 *
	 * @access protected
	 *
	 * @return array The initial widget config.
	 */
	protected function _get_initial_config() {

		return array_merge(
			parent::_get_initial_config(), [
				'widget_type' => $this->get_name(),
				'keywords' => $this->get_keywords(),
				'categories' => $this->get_categories(),
			]
		);
	}

	/**
	 * Print widget template.
	 *
	 * Used to generate the widget template on the editor.
	 *
	 * @access public
	 */
	final public function print_template() {
		ob_start();

		$this->_content_template();

		$content_template = ob_get_clean();

		$content_template = apply_filters( 'elementor/widget/print_template', $content_template,  $this );

		if ( empty( $content_template ) ) {
			return;
		}
		?>
		<script type="text/html" id="tmpl-elementor-<?php echo static::get_type(); ?>-<?php echo esc_attr( $this->get_name() ); ?>-content">
			<?php $this->_render_settings(); ?>
			<div class="elementor-widget-container">
				<?php echo $content_template; ?>
			</div>
		</script>
		<?php
	}

	/**
	 * Render widget settings.
	 *
	 * Used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function _render_settings() {
		?>
		<div class="elementor-element-overlay">
			<ul class="elementor-editor-element-settings elementor-editor-widget-settings">
				<li class="elementor-editor-element-setting elementor-editor-element-trigger" title="<?php printf( __( 'Edit %s', 'elementor' ), __( 'Widget', 'elementor' ) ); ?>">
					<i class="eicon-edit"></i>
				</li>
				<?php foreach ( self::get_edit_tools() as $edit_tool_name => $edit_tool ) : ?>
					<li class="elementor-editor-element-setting elementor-editor-element-<?php echo $edit_tool_name; ?>" title="<?php echo $edit_tool['title']; ?>">
						<span class="elementor-screen-only"><?php echo $edit_tool['title']; ?></span>
						<i class="eicon-<?php echo $edit_tool['icon']; ?>"></i>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
		<?php
	}

	/**
	 * Parse text editor.
	 *
	 * Parses the content from reach text exitor with shortcodes, oembed and
	 * filtered data.
	 *
	 * @access protected
	 *
	 * @param string $content Text editor content.
	 *
	 * @return string Parsed content.
	 */
	protected function parse_text_editor( $content ) {
		$content = apply_filters( 'widget_text', $content, $this->get_settings() );

		$content = shortcode_unautop( $content );
		$content = do_shortcode( $content );

		if ( $GLOBALS['wp_embed'] instanceof \WP_Embed ) {
			$content = $GLOBALS['wp_embed']->autoembed( $content );
		}

		return $content;
	}

	/**
	 * Render widget output on the frontend.
	 *
	 * Used to generate the final HTML displayed on the frontend.
	 *
	 * @access public
	 */
	public function render_content() {
		do_action( 'elementor/widget/before_render_content', $this );

		if ( Plugin::$instance->editor->is_edit_mode() ) {
			$this->_render_settings();
		}

		?>
		<div class="elementor-widget-container">
			<?php
			ob_start();

			$skin = $this->get_current_skin();
			if ( $skin ) {
				$skin->set_parent( $this );
				$skin->render();
			} else {
				$this->render();
			}

			echo apply_filters( 'elementor/widget/render_content', ob_get_clean(), $this );
			?>
		</div>
		<?php
	}

	/**
	 * Render widget plain content.
	 *
	 * Output the widget final HTML on the frontend.
	 *
	 * @access public
	 */
	public function render_plain_content() {
		$this->render_content();
	}

	/**
	 * Add render attributes.
	 *
	 * Used to add render attributes to the widget.
	 *
	 * @access protected
	 */
	protected function _add_render_attributes() {
		parent::_add_render_attributes();

		$this->add_render_attribute(
			'_wrapper', 'class', [
				'elementor-widget',
				'elementor-widget-' . $this->get_name(),
			]
		);

		$settings = $this->get_settings();

		$this->add_render_attribute( '_wrapper', 'data-element_type', $this->get_name() . '.' . ( ! empty( $settings['_skin'] ) ? $settings['_skin'] : 'default' ) );
	}

	/**
	 * Before widget rendering.
	 *
	 * Used to add stuff before the widget.
	 *
	 * @access public
	 */
	public function before_render() {
		?>
		<div <?php echo $this->get_render_attribute_string( '_wrapper' ); ?>>
		<?php
	}

	/**
	 * After widget rendering.
	 *
	 * Used to add stuff after the widget.
	 *
	 * @access public
	 */
	public function after_render() {
		?>
		</div>
		<?php
	}

	/**
	 * Retrieve the element raw data.
	 *
	 * Get the raw element data, including the id, type, settings, child
	 * elements and whether it is an inner element.
	 *
	 * The data with the HTML used always to display the data, but the Elementor
	 * editor uses the raw data without the HTML in order not to render the data
	 * again.
	 *
	 * @access public
	 *
	 * @param bool $with_html_content Optional. Whether to return the data with
	 *                                HTML content or without. Used for caching.
	 *                                Default is false, without HTML.
	 *
	 * @return array Element raw data.
	 */
	public function get_raw_data( $with_html_content = false ) {
		$data = parent::get_raw_data( $with_html_content );

		unset( $data['isInner'] );

		$data['widgetType'] = $this->get_data( 'widgetType' );

		if ( $with_html_content ) {
			ob_start();

			$this->render_content();

			$data['htmlCache'] = ob_get_clean();
		}

		return $data;
	}

	/**
	 * Print widget content.
	 *
	 * Output the widget final HTML on the frontend.
	 *
	 * @access protected
	 */
	protected function _print_content() {
		$this->render_content();
	}

	/**
	 * Retrieve default data.
	 *
	 * Get the default widget data. Used to reset the data on initialization.
	 *
	 * @access protected
	 *
	 * @return array Default data.
	 */
	protected function get_default_data() {
		$data = parent::get_default_data();

		$data['widgetType'] = '';

		return $data;
	}

	/**
	 * Retrieve child type.
	 *
	 * Get the widget child type based on element data.
	 *
	 * @access protected
	 *
	 * @param array $element_data Widget ID.
	 *
	 * @return array|false Child type or false if it's not a valid widget.
	 */
	protected function _get_default_child_type( array $element_data ) {
		return Plugin::$instance->elements_manager->get_element_types( 'section' );
	}

	/**
	 * Add new skin.
	 *
	 * Register new widget skin to allow the user to set custom designs.
	 *
	 * @access public
	 *
	 * @param Skin_Base $skin Skin instance.
	 */
	public function add_skin( Skin_Base $skin ) {
		Plugin::$instance->skins_manager->add_skin( $this, $skin );
	}

	/**
	 * Retrieve single skin.
	 *
	 * Get a single skin based on skin ID, from all the skin assigned to the
	 * widget. If the skin does not exist or not assigned to the widget, return
	 * false.
	 *
	 * @access public
	 *
	 * @param string $skin_id Skin ID.
	 *
	 * @return string|false Single skin, or false.
	 */
	public function get_skin( $skin_id ) {
		$skins = $this->get_skins();
		if ( isset( $skins[ $skin_id ] ) ) {
			return $skins[ $skin_id ];
		}

		return false;
	}

	/**
	 * Retrieve current skin ID.
	 *
	 * Get the ID of the current skin.
	 *
	 * @access public
	 *
	 * @return array Current skin
	 */
	public function get_current_skin_id() {
		return $this->get_settings( '_skin' );
	}

	/**
	 * Retrieve current skin.
	 *
	 * Get the current skin, or if non exist return false.
	 *
	 * @access public
	 *
	 * @return Skin_Base[]|false
	 */
	public function get_current_skin() {
		return $this->get_skin( $this->get_current_skin_id() );
	}

	/**
	 * Remove widget skin.
	 *
	 * Unregister an existing skin and remove it from the widget.
	 *
	 * @access public
	 *
	 * @param string $skin_id Skin ID.
	 *
	 * @return WP_Error|true Whether the skin was removed successfully from the widget.
	 */
	public function remove_skin( $skin_id ) {
		return Plugin::$instance->skins_manager->remove_skin( $this, $skin_id );
	}

	/**
	 * Retrieve widget skins.
	 *
	 * Get all the skin assigned to the widget.
	 *
	 * @access public
	 *
	 * @return Skin_Base[]
	 */
	public function get_skins() {
		return Plugin::$instance->skins_manager->get_skins( $this );
	}
}
