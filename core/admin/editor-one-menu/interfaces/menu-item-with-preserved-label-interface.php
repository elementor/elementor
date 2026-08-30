<?php

namespace Elementor\Core\Admin\EditorOneMenu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Menu_Item_With_Preserved_Label_Interface {

	public function should_preserve_label_casing(): bool;
}
