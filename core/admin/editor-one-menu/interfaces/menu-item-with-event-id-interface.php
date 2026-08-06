<?php

namespace Elementor\Core\Admin\EditorOneMenu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Menu_Item_With_Event_Id_Interface {

	public function get_event_id(): string;
}
