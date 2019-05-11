# passwd-react-ui

## Summary
This is a complete rewrite of the frontend for [EnsoPasswd](https://github.com/ensoorigins/EnsoPasswd) which features complete retrocompatibility with the API found in the original project.

## Motivation
The motivation for this rewrite was mainly to learn react. But also to undo lots of mistakes which I had previously made with the project.

As background it should be noted that EnsoPasswd was the result of a ~4 month curricular internship in the context of my engineering degree, where I first became in contact with dynamic webpages and a UI-API structure for the web.

After that I thought a lot could be done still to make it seem more robust and to deal with situations where the API might be a little slower as you can find often on production environments, and in general give a little more polish to the UI, playing with transitions, loaders, and a whole new layout.

All work on this project was done in my free time.

# Installation instructions
Requires `nodejs` and `yarn` installed in your system.

```bash
git clone https://github.com/xympa/passwd-react-ui.git #this repo
cd passwd-react-ui
#edit configuration variables, for useHashRouter see 'Apache Notes'
vim ./src/AppConfig.js
yarn install && yarn build
cd build
#Apache -> move this to your document root
#Serve -> serve -s ./
```

## Apache notes
In order for reloads on routes to not throw a 404 please include a proper .htaccess redirecting all requests to the index file, such as:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

Or use the configuration variable `useHashRouter` as set to `true`

[More information on the issue / accessing on a subdirectory](https://www.andreasreiterer.at/fix-browserrouter-on-apache/) 

# Credits
Thank you to everyone who contributed to any of the many open source libraries and frameworks I've used throughout this project.
Thanks also to Enso for allowing me to work on a project which even though open-source was a result of 100% of their time / vision.