<?php
/**
 * DEMO - DO NOT MERGE.
 *
 * Deliberately trips every active check in bin/check-twig-safety.sh so the
 * Lint / PHP-Lint job in CI fails on the "Twig safety check" step. Delete
 * this file before merging the parent PR.
 *
 * This file is never autoloaded and never executed at runtime.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Demo_Twig_Violations {
	public function run(): void {
		$env = new ElementorDeps\Twig\Environment( null );

		$env->enableSandbox();
		$env->addExtension( new ElementorDeps\Twig\Extension\SandboxExtension( null ) );

		$env->setSourcePolicy( new class implements ElementorDeps\Twig\Sandbox\SourcePolicyInterface {} );

		$env->template_from_string( '<div>{{ payload }}</div>' );

		$profiler = new ElementorDeps\Twig\Profiler\Dumper\HtmlDumper();
		$env->addExtension( new ElementorDeps\Twig\Extension\ProfilerExtension( null ) );

		echo spaceless( '<p>x</p>' );
		echo twig_spaceless( '<p>y</p>' );
	}
}
