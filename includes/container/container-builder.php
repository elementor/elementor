<?php

namespace Elementor\Container;

use ElementorDeps\DI\ContainerBuilder as DIContainerBuilder;
use ElementorDeps\DI\Container as DIContainer;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Container_Builder
{
	private DIContainerBuilder $builder;

	public function __construct() {
		$this->builder = new DIContainerBuilder();
	}

	public function with_configurations(): self {
		$this->builder->addDefinitions(__DIR__ . '/configurations/config.php');
//		$this->builder->enableCompilation(__DIR__ . '/tmp'); // /var/cache
//		$this->builder->writeProxiesToFile(true, __DIR__ . '/tmp/proxies');

		return $this;
	}

	public function with_experiment_configurations(): self {
		$this->builder->addDefinitions(__DIR__ . '/configurations/experiment-config.php');
		$this->builder->enableCompilation(__DIR__ . '/tmp'); // /var/cache
		$this->builder->writeProxiesToFile(true, __DIR__ . '/tmp/proxies');
//		$this->builder->enableDefinitionCache();

		return $this;
	}

	/**
	 * @throws Exception
	 */
	public function build(): DIContainer {
		return $this->builder->build();
	}
}
