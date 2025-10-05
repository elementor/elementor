Study reset and body classes/styling.

E.g.
body {
        background: pink;
}

h1 {
        font-size: 20px;
}

Study if we can map this default styling in the original document.

Page Builder styling:
Study how and where we can set this styling in Elementor v4.
Elementor v3 has Site Settings, which we might have to use for now.

Alternativey we could decide to enqueue a reset.css style file or load the css in the theme customiser stylesheet. In that way we might be able to map the reset styling from the original url as closely as possible.

Remove default theme styling:
Probably we will work with the Hello Theme. It has the option to deactivate all default styling:
http://elementor.local:10003/wp-admin/admin.php?page=hello-elementor-settings

Disable default widget styling:
Atomic widgets have default styling, e.g. font-size and margin for h1. But it will be difficult to map this with the import url.
Preferably I would disable/remove all default v4 widget styling. Study how we can do this.
