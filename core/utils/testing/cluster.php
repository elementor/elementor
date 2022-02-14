<?php

namespace Elementor\Core\Utils\Testing;

class Cluster {

	/**
	 * A list of Test classes linked to the cluster.
	 *
	 * @var string[]
	 */
	protected $test_classes = [];

	/**
	 * A list of Test instances linked to the cluster.
	 *
	 * @var Test[]
	 */
	protected $tests = [];

	/**
	 * A Configuration instance with customized options regarding the cluster's tests.
	 *
	 * @var Configuration
	 */
	protected $configuration;

	/**
	 * The Cluster constructor.
	 *
	 * @param string[] $test_classes
	 * @param Configuration|array $configuration
	 *
	 * @throws \Exception
	 */
	public function __construct( $test_classes, $configuration ) {
		$this->test_classes = $test_classes;
		$this->configuration = Configuration::create( $configuration );
	}

	/**
	 * Get all cluster's Test instances.
	 *
	 * @return Test[]
	 */
	public function get_tests() {
		if ( empty( $this->test_classes ) ) {
			throw new \Exception( 'A Cluster must contain at least one test.' );
		} else if ( empty( $this->tests ) ) {
			foreach( $this->test_classes as $test_class ) {
				$this->tests[] = new $test_class(
					// Provide the cluster's configuration to all its tests
					$this->configuration
				);
			}
		}

		return $this->tests;
	}

	/**
	 * Run all cluster's tests.
	 *
	 * @return void
	 */
	public function run() {
		foreach( $this->get_tests() as $test ) {
			$test->run();
		}
	}
}
