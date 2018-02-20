<?php
namespace Elementor\Core\DynamicTags;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Data_Tag extends Base_Tag {

	final public function get_content_type() {
		return 'plain';
	}
}
