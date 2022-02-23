<?php

namespace Elementor\Core\Utils\Checking;

use Elementor\Core\Utils\Checking\Exceptions\Check_Exception;

class Cluster extends Diagnosable {

	/**
	 * A list of Check classes linked to the cluster.
	 *
	 * @var string[]
	 */
	protected $checks = [];

	/**
	 * A list of Check instances linked to the cluster.
	 *
	 * @var Array<string, Check>
	 */
	protected $instances = [];

	/**
	 * A Configuration instance with customized options regarding the cluster's checks.
	 *
	 * @var Configuration
	 */
	protected $configuration;

	/**
	 * The Cluster constructor.
	 *
	 * @param string[] $checks
	 * @param Configuration|array $configuration
	 *
	 * @throws \Exception
	 */
	public function __construct( $checks, $configuration ) {
		$this->checks = $checks;
		$this->configuration = Configuration::create( $configuration );
	}

	/**
	 * Get a hushed instance-id of the cluster as its representation.
	 *
	 * @inheritDoc
	 */
	public function get_name() {
		return get_class( $this );
	}

	/**
	 * Get all cluster's Check instances.
	 *
	 * @inheritDoc
	 */
	public function get_diagnosables() {
		return array_values( $this->instances );
	}

	/**
	 * Instantiate all Check classes that are linked to the cluster.
	 *
	 * @return Check[]
	 * @throws \Exception
	 */
	protected function instantiate() {
		if ( empty( $this->checks ) ) {
			throw new \Exception( 'A Cluster must contain at least one check.' );
		} elseif ( empty( $this->instances ) ) {
			foreach ( $this->checks as $check ) {
				$this->instances[ $check ] = new $check(
					// Provide the cluster's configuration to all its checks
					$this->configuration
				);
			}
		}

		return $this->instances;
	}

	/**
	 * Run all cluster's checks.
	 *
	 * @return static
	 * @throws \Exception|Check_Exception
	 */
	public function run() {
		if ( empty( $this->instances ) ) {
			$this->instantiate();
		}

		foreach ( $this->instances as $check ) {
			$check->run();
		}

		return $this;
	}

	/**
	 * If there was an error in one of the checks, an exception will be returned.
	 *
	 * @inheritDoc
	 */
	public function error() {
		foreach ( $this->instances as $instance ) {
			if ( $instance->error() ) {
				return new \Exception();
			}
		}
		return null;
	}
}
