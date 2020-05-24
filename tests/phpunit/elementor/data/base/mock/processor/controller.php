<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Processor;

class Controller extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller {

	/**
	 * Used for processor to access controller.
	 *
	 * @var \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Processor\Controller
	 */
	public static $fake_instance;

	/**
	 * @var \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Processor\Processor
	 */
	public static $fake_processor_instance;

	public function register_processors() {
		self::$fake_instance = $this;
		self::$fake_processor_instance = $this->register_processor( Processor::class );
	}
}
