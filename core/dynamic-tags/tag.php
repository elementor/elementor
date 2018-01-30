<?php
namespace Elementor\Core\DynamicTags;

use Elementor\Controls_Stack;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Tag extends Base_Tag {

	final public function get_content() {
		ob_start();
		?>
		<span id="elementor-tag-<?php echo $this->get_id(); ?>" class="elementor-tag"><?php $this->render(); ?></span>
		<?php
		return ob_get_clean();
	}

	final public function get_content_type() {
		return 'ui';
	}
}
