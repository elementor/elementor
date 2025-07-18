<?php

namespace Elementor\V4\Widgets;

class Hero_Factory {

    public function define($ctx) {
        $ctx
            ->title('V4 Hero')
            ->name('v4-hero')
            ->atomic();
    }

    public function define_properties($ctx) {
        $ctx->property('image')
            ->label('Hero Image')
            ->default(null)
            ->kind('image');

        $ctx->property('title')
            ->label('Hero Title')
            ->default('Hero Title')
            ->kind('text_area');

        $ctx->property('subtitle')
            ->label('Hero Subtitle')
            ->default('Hero Subtitle')
            ->kind('text_area');

        $ctx->property('link')
            ->label('Call To Action Link')
            ->default(null)
            ->kind('link');

        $ctx->property('cta')
            ->label('Call To Action Text')
            ->default('Learn More')
            ->kind('text');

        $ctx->property('show_cta')
            ->label('Show Call To Action')
            ->default(true)
            ->kind('boolean');
    }
    
    public function define_renderer($ctx) {
        $ctx
            ->twig(__DIR__ . '/hero.html.twig')
            ->js(__DIR__ . '/hero.js')
            ->css(__DIR__ . '/hero.css');
    }
}

add_action('elementor/widgets/define', function($ctx) {
    $factory = new Hero_Factory();
    $ctx->register($factory);
});