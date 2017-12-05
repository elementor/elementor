<?php
namespace Elementor\Modules\Tags\Tags;

use Elementor\Controls_Manager;
use Elementor\Core\MicroElements\Base_Tag;
use Elementor\Modules\Tags\Module;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Icon extends Base_Tag {

	public function get_name() {
		return 'icon';
	}

	public function get_group() {
		return Module::DEFAULT_GROUP;
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

	public function get_mention_template() {
		return '<i class="{{ icon }}"></i>';
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
