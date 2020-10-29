<?php
namespace Elementor\Data\Base\SubEndpoint;

use Elementor\Data\Base\Interfaces\SubEndpoint;
use Elementor\Data\Base\Endpoint;

class Proxy extends Endpoint\Proxy implements SubEndpoint {
	/**
	 * @var \Elementor\Data\Base\SubEndpoint
	 */
	protected $real_endpoint;

	public function get_parent() {
		return $this->real_endpoint->get_parent();
	}

	public function get_name_ancestry() {
		return $this->real_endpoint->get_name_ancestry();
	}
}
