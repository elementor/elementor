<?php
namespace Elementor\Core\Isolation;

class Wordpress_Adapter implements Wordpress_Adapter_Interface {

	public function get_plugins(): array {
		return get_plugins();
	}
}
