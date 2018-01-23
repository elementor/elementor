<?php
namespace Elementor\Core\DynamicTags;

use Elementor\Controls_Stack;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Markup_Dynamic_Tag extends Dynamic_Tag {

	protected function _get_initial_config() {
		$config = parent::_get_initial_config();

		$config['content_type'] = 'ui';

		return $config;
	}

	public function get_content() {
		ob_start();
		?>
		<span id="elementor-tag-<?php echo $this->get_id(); ?>" class="elementor-tag"><?php $this->render(); ?></span>
		<?php
		return ob_get_clean();
	}
}
