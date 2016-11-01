<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Library_Template extends Widget_Base {

	public function get_name() {
		return 'library-template';
	}

	public function get_title() {
		return __( 'Library Template', 'elementor' );
	}

	public function get_icon() {
		return 'posts-masonry';
	}

	public function is_reload_preview_required() {
		return false;
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_template',
			[
				'label' => __( 'Template', 'elementor' ),
			]
		);

		$source    = Plugin::instance()->templates_manager->get_source( 'local' );
		$templates = $source->get_items();
		$options = [];

		foreach ( $templates as $template ) {
			$options[ $template['template_id'] ] = $template['title'];
		}

		$this->add_control(
			'template_id',
			[
				'label' => __( 'Choose Tempalte', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => $options,
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$template_id = $this->get_settings( 'template_id' );
		?>
		<div class="elementor-template">
			<?php
			echo Plugin::instance()->frontend->get_builder_content_for_display( $template_id );
			?>
		</div>
		<?php
	}
}
