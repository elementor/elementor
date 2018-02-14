<?php
namespace Elementor\Modules\DynamicTags\Tags;

use Elementor\Controls_Manager;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Icon extends Tag {

	public function get_name() {
		return 'icon';
	}

	public function get_group() {
		return Module::BASE_GROUP;
	}

	public function get_categories() {
		return [ Module::TEXT_CATEGORY ];
	}

	public function get_title() {
		return __( 'Icon', 'elementor' );
	}

	public function _register_controls() {
		$this->add_control(
			'icon',
			[
				'type' => Controls_Manager::ICON,
				'label' => __( 'Icon', 'elementor' ),
				'default' => 'fa fa-heart',
				'label_block' => true,
			]
		);

		$this->add_control(
			'icon_color',
			[
				'type' => Controls_Manager::COLOR,
				'label' => __( 'Color', 'elementor' ),
				'selectors' => [
					'{{WRAPPER}}' => 'color: {{VALUE}}',
				],
			]
		);
	}

	public function print_panel_template() {
		?>
		<i class="{{ icon }}" style="color: {{{ icon_color }}}"></i>
		<?php
	}

	protected function _content_template() {
		?>
		<i class="{{ icon }}"></i>
		<?php
	}

	protected function render() {
		$settings = $this->get_active_settings();
		?>
		<i class="<?php echo $settings['icon']; ?>"></i>
		<?php
	}
}
