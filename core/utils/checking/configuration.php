<?php

namespace Elementor\Core\Utils\Checking;

class Configuration {

	/**
	 * A subject to perform checks on, unless specified otherwise in check-case `expect` method.
	 *
	 * @var mixed
	 */
	public $subject;

	/**
	 * A min number of expectations each check-case should describe.
	 *
	 * @var int
	 */
	public $min_expectations = 1;

	/**
	 * Whether to stop the checking workflow after first failure of check, which means - one of the subjects didn't meet
	 * the expectations.
	 *
	 * @var bool
	 */
	public $stop_on_failure = false;

	/**
	 * Whether to stop the checking workflow after first error of check, which means - an exception was thrown while
	 * inspecting one of the check-case.
	 *
	 * @var bool
	 */
	public $stop_on_error = false;

	/**
	 * The Configuration constructor.
	 *
	 * @param array $config
	 *
	 * @throws \Exception
	 */
	public function __construct( $config = [] ) {
		if ( ! empty( $config ) ) {
			$this->parse_config( $config );
		}
	}

	/**
	 * Create a new Configuration object from given config array unless it already is.
	 *s
	 * @param Configuration|array $configuration
	 *
	 * @return static
	 * @throws \Exception
	 */
	public static function create( $configuration ) {
		return ! ( $configuration instanceof static ) ?
			new static( $configuration ) :
			$configuration;
	}

	/**
	 * Parse config properties from an array and assign them into the configuration class.
	 *
	 * @param array $config
	 *
	 * @return void
	 * @throws \Exception
	 */
	protected function parse_config( $config ) {
		foreach ( $config as $key => $value ) {
			if ( ! property_exists( $this, $key ) ) {
				throw new \Exception( "Checking configuration is not supporting `$key` property." );
			}

			$this->$key = $value;
		}
	}
}
