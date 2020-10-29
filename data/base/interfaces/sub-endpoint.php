<?php

namespace Elementor\Data\Base\Interfaces;

interface SubEndpoint extends Endpoint {
	/**
	 * Get parent endpoint.
	 *
	 * @return \Elementor\Data\Base\Endpoint|\Elementor\Data\Base\SubEndpoint
	 */
	public function get_parent();

	/**
	 * Get name ancestry format, example: 'alpha/beta/delta'.
	 * @return string
	 */
	public function get_name_ancestry();
}
