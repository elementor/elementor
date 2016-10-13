<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Widget_Base extends Element_Base {

	public static function get_type() {
		return 'widget';
	}

	public function get_icon() {
		return 'apps';
	}

	public final function print_template() {
		ob_start();

		$this->_content_template();

		$content_template = ob_get_clean();

		$content_template = apply_filters( 'elementor/widget/print_template', $content_template,  $this );

		if ( empty( $content_template ) ) {
			return;
		}
		?>
		<script type="text/html" id="tmpl-elementor-<?php echo static::get_type(); ?>-<?php echo esc_attr( $this->get_name() ); ?>-content">
			<?php self::_render_settings(); ?>
			<div class="elementor-widget-container">
				<?php echo $content_template; ?>
			</div>
		</script>
		<?php
	}

	protected function _render_settings() {
		?>
		<div class="elementor-editor-element-settings elementor-editor-<?php echo esc_attr( static::get_type() ); ?>-settings elementor-editor-<?php echo esc_attr( $this->get_name() ); ?>-settings">
			<ul class="elementor-editor-element-settings-list">
				<li class="elementor-editor-element-setting elementor-editor-element-edit">
					<a href="#" title="<?php _e( 'Edit', 'elementor' ); ?>">
						<span class="elementor-screen-only"><?php _e( 'Edit', 'elementor' ); ?></span>
						<i class="fa fa-pencil"></i>
					</a>
				</li>
				<li class="elementor-editor-element-setting elementor-editor-element-duplicate">
					<a href="#" title="<?php _e( 'Duplicate', 'elementor' ); ?>">
						<span class="elementor-screen-only"><?php _e( 'Duplicate', 'elementor' ); ?></span>
						<i class="fa fa-files-o"></i>
					</a>
				</li>
				<li class="elementor-editor-element-setting elementor-editor-element-remove">
					<a href="#" title="<?php _e( 'Remove', 'elementor' ); ?>">
						<span class="elementor-screen-only"><?php _e( 'Remove', 'elementor' ); ?></span>
						<i class="fa fa-times"></i>
					</a>
				</li>
			</ul>
		</div>
		<?php
	}

	protected function parse_text_editor( $content ) {
		$content = apply_filters( 'widget_text', $content, $this->get_settings() );

		$content = shortcode_unautop( $content );
		$content = do_shortcode( $content );

		if ( $GLOBALS['wp_embed'] instanceof \WP_Embed ) {
			$content = $GLOBALS['wp_embed']->autoembed( $content );
		}

		return $content;
	}

	public function render_content() {
		if ( Plugin::instance()->editor->is_edit_mode() ) {
			$this->_render_settings();
		}
		?>
		<div class="elementor-widget-container">
			<?php
			ob_start();

			$this->render();

			echo apply_filters( 'elementor/widget/render_content', ob_get_clean(), $this );
			?>
		</div>
		<?php
	}

	public function render_plain_content() {
		$this->render_content();
	}

	public function before_render() {
		$this->add_render_attribute( 'wrapper', 'class', [
			'elementor-widget',
			'elementor-element',
			'elementor-element-' . $this->get_id(),
			'elementor-widget-' . $this->get_name(),
		] );

		$settings = $this->get_settings();

		foreach ( self::get_class_controls() as $control ) {
			if ( empty( $settings[ $control['name'] ] ) )
				continue;

			if ( ! $this->is_control_visible( $control ) )
				continue;

			$this->add_render_attribute( 'wrapper', 'class', $control['prefix_class'] . $settings[ $control['name'] ] );
		}

		if ( ! empty( $settings['_animation'] ) ) {
			$this->add_render_attribute( 'wrapper', 'data-animation', $settings['_animation'] );
		}

		$this->add_render_attribute( 'wrapper', 'data-element_type', $this->get_name() );
		?>
		<div <?php echo $this->get_render_attribute_string( 'wrapper' ); ?>>
		<?php
	}

	public function after_render() {
		?>
		</div>
		<?php
	}

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

	protected function _print_content() {
		$this->render_content();
	}

	protected function get_default_data() {
		$data = parent::get_default_data();

		$data['widgetType'] = '';

		return $data;
	}

	protected function _get_child_type( array $element_data ) {
		return Plugin::instance()->elements_manager->get_element_types( 'section' );
	}
}
