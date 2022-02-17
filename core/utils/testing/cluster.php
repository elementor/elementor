<?php

namespace Elementor\Core\Utils\Testing;

use Elementor\Core\Utils\Testing\Exceptions\Test_Exception;
use Elementor\Core\Utils\Testing\Interfaces\Diagnosable;

class Cluster implements Diagnosable {

	/**
	 * A list of Test classes linked to the cluster.
	 *
	 * @var string[]
	 */
	protected $tests = [];

	/**
	 * A list of Test instances linked to the cluster.
	 *
	 * @var Test[]
	 */
	protected $instances = [];

	/**
	 * A Configuration instance with customized options regarding the cluster's tests.
	 *
	 * @var Configuration
	 */
	protected $configuration;

	/**
	 * An exception from last failure of the test (if failed).
	 *
	 * @var \Exception
	 */
	protected $exception;

	/**
	 * The Cluster constructor.
	 *
	 * @param string[] $tests
	 * @param Configuration|array $configuration
	 *
	 * @throws \Exception
	 */
	public function __construct( $tests, $configuration ) {
		$this->tests = $tests;
		$this->configuration = Configuration::create( $configuration );
	}

	/**
	 * Get a hushed instance-id of the cluster as its representation.
	 *
	 * @inheritDoc
	 */
	public function get_name() {
		return get_class( $this ) . spl_object_hash( $this );
	}

	/**
	 * Get all cluster's Test instances.
	 *
	 * @inheritDoc
	 */
	public function get_diagnosables() {
		return $this->instances;
	}

	/**
	 * Instantiate all Test classes that are linked to the cluster.
	 *
	 * @return Test[]
	 * @throws \Exception
	 */
	protected function instantiate() {
		if ( empty( $this->tests ) ) {
			throw new \Exception( 'A Cluster must contain at least one test.' );
		} else if ( empty( $this->instances ) ) {
			foreach( $this->tests as $test ) {
				$this->instances[ $test ] = new $test(
					// Provide the cluster's configuration to all its tests
					$this->configuration
				);
			}
		}

		return $this->instances;
	}

	/**
	 * Run all cluster's tests.
	 *
	 * @return void
	 * @throws \Exception|Test_Exception
	 */
	public function run() {
		if ( empty( $this->instances ) ) {
			$this->instantiate();
		}

		foreach( $this->instances as $test ) {
			$test->run();
		}
	}

	/**
	 * If there was an error in one of the tests, an exception will be returned.
	 *
	 * @inheritDoc
	 */
	public function error() {
		foreach( $this->instances as $instance ) {
			if ( $instance->error() ) {
				return false;
			}
		}
		return new \Exception();
	}
}
