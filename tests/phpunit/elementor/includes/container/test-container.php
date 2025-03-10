<?php

namespace Elementor\Tests\Phpunit\Includes\Container;

use Elementor\Container\Container;
use Elementor\Core\Isolation\Plugin_Status_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Core\Utils\Version;
use Elementor\Plugin;
use Elementor\Tests\Phpunit\Includes\Container\Traits\Trait_Test_Container;
use ElementorDeps\DI\DependencyException;
use ElementorDeps\DI\NotFoundException;
use ElementorEditorTesting\Elementor_Test_Base;
use ElementorDeps\DI as DI;

class Test_Container extends Elementor_Test_Base {
	use Trait_Test_Container;

	private DI\Container $container;

	public function setUp(): void {
		parent::setUp();
		$this->container = Plugin::$instance->elementor_container();
	}

	/**
	 * @throws NotFoundException
	 * @throws DependencyException
	 */
	public function test_interface_binding() {
		// Bind the interface to the implementation
		$this->bind( Wordpress_Adapter_Interface::class, Wordpress_Adapter::class );

		$implementation = $this->container->get( Wordpress_Adapter_Interface::class );

		$this->assertInstanceOf( Wordpress_Adapter::class, $implementation );
	}

	/**
	 * @throws NotFoundException
	 * @throws DependencyException
	 */
	public function test_container_resolves_dependencies() {
		$this->bind( Wordpress_Adapter_Interface::class, Wordpress_Adapter::class );

		$myClassInstance = $this->container->get( Plugin_Status_Adapter::class );

		$this->assertInstanceOf( Wordpress_Adapter_Interface::class, $myClassInstance->wordpress_adapter );
	}

	/**
	 * @throws NotFoundException
	 * @throws DependencyException
	 */
	public function test_singleton() {
		$wp_adapter1 = $this->container->get( Wordpress_Adapter::class );
		$wp_adapter2 = $this->container->get( Wordpress_Adapter::class );

		$this->assertSame( $wp_adapter1, $wp_adapter2 );
	}

	public function test_unregistered_dependency_class_throws_exception() {
		$this->expectException( DI\NotFoundException::class );

		$this->container->get( UnregisteredClass::class );
	}

	public function test_configuration_injection() {
		$major_version1 = '3.25';
		$major_version2 = '3.25';
		$patch = '3.24-patch';
		$stage = '3.24-stage';

		$this->container->set(
			Version::class,
			DI\create( Version::class )
				->constructor(
					$major_version1,
					$major_version2,
					$patch,
					$stage
				)
		);

		$versionClass = $this->container->get( Version::class );

		$this->assertEquals( $major_version1, $versionClass->major1 );
		$this->assertEquals( $major_version2, $versionClass->major2 );
		$this->assertEquals( $patch, $versionClass->patch );
		$this->assertEquals( $stage, $versionClass->stage );
	}

	public function test_alias_returns_same_instance() {
		$this->container->set( 'wp-adapter', DI\get( Wordpress_Adapter::class ) );

		$service = $this->container->get( Wordpress_Adapter::class );
		$aliasService = $this->container->get( 'wp-adapter' );

		$this->assertSame( $service, $aliasService );
	}

	/**
	 * @throws NotFoundException
	 * @throws DependencyException
	 */
	public function test_non_singlet_service() {
		$service1 = $this->container->make( Wordpress_Adapter::class );
		$service2 = $this->container->make( Wordpress_Adapter::class );

		$this->assertNotSame( $service1, $service2 );
	}

	public function test_cannot_recreate_container() {
		$firstInstance = Container::get_instance();

		Container::initialize_instance();
		$secondInstance = Container::get_instance();

		$this->assertSame( $firstInstance, $secondInstance, 'Container was recreated, but it should be a singleton.' );
	}
}
