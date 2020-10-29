<?php
namespace Elementor\Data\Base\Interfaces;

interface Endpoint extends EndpointRoute {
	/**
	 * Get endpoint name.
	 *
	 * @return string
	 */
	public function get_name();

	/**
	 * Get endpoint format.
	 *
	 * @note The formats that generated using this function, will be used only be `Data\Manager::run()`.
	 *
	 * @return string
	 */
	public function get_format();

	/**
	 * Get controller.
	 *
	 * @return \Elementor\Data\Base\Controller
	 */
	public function get_controller();

	/**
	 * Get current parent.
	 *
	 * @return \Elementor\Data\Base\Controller|\Elementor\Data\Base\Endpoint
	 */
	public function get_parent();

	/**
	 * Get public name.
	 *
	 * @return string
	 */
	public function get_public_name();

	/**
	 * Get full command name ( including index ).
	 *
	 * @return string
	 */
	public function get_full_command();

	/**
	 * Get name ancestry format, example: 'alpha/beta/delta'.
	 *
	 * @return string
	 */
	public function get_name_ancestry();

	/**
	 * Register sub endpoint.
	 *
	 * @param \Elementor\Data\Base\Endpoint $endpoint
	 *
	 * @return \Elementor\Data\Base\Endpoint\Proxy
	 */
	public function register_sub_endpoint( \Elementor\Data\Base\Endpoint $endpoint );
}
