# static_crop

NodeJS web server thats crops and / or resizes images from the Zooniverse's static media server

## What is it?
A HTTP wrapper over image magic that offers crop, resize and crop_resize functions on the image specified by a query param `u`. Note: the `?u=` query param should be a path suffix from the specified static server hostname. E.g the following media resource `u` query param:
+ `http://zooniverse-static.s3-website-us-east-1.amazonaws.com/panoptes-uploads.zooniverse.org/production/subject_location/90a3b642-55e2-4583-a4fb-2f0abeb5b285.jpeg`
+ `u=panoptes-uploads.zooniverse.org/production/subject_location/90a3b642-55e2-4583-a4fb-2f0abeb5b285.jpeg`

## /crop route
Crop route can be specified in two formats and all dimensions are in pixels.

1. Params are: w x h dimensions at the x, y offset.

  + https://imgproc.zooniverse.org/crop?w=150&h=150&x=300&y=175&u=panoptes-uploads.zooniverse.org/production/subject_location/90a3b642-55e2-4583-a4fb-2f0abeb5b285.jpeg

1. Params are part of the url path: /w/h/x/y/u, note the path to the image (u) should be url encoded, e.g.
  + https://imgproc.zooniverse.org/crop/150/150/300/175/panoptes-uploads.zooniverse.org%2Fproduction%2Fsubject_location%2F90a3b642-55e2-4583-a4fb-2f0abeb5b285.jpeg

## /resize route
Resize the image, dimensions are in pixels and can be overwritten by o url. See http://www.graphicsmagick.org/GraphicsMagick.html#details-resize.

Params are: w x h dimensions and an options o to specify the resize options mentioned above.

 + https://imgproc.zooniverse.org/resize?w=500&h=600&u=panoptes-uploads.zooniverse.org/production/subject_location/90a3b642-55e2-4583-a4fb-2f0abeb5b285.jpeg
 + https://imgproc.zooniverse.org/resize?o=%&w=100&h=100&u=panoptes-uploads.zooniverse.org/production/subject_location/90a3b642-55e2-4583-a4fb-2f0abeb5b285.jpeg


## /resize_crop route
The image should be resized to fill the dimensions as much as possible, so cropping may be necessary. For example, if the image is 200x800, and you want to resize to 100x100, the image would first be resized to 100x400, and then the height would be cropped down to 100.

Params are: w x h dimensions.

+ https://imgproc.zooniverse.org/resize_crop?w=500&h=600&u=panoptes-uploads.zooniverse.org/production/subject_location/90a3b642-55e2-4583-a4fb-2f0abeb5b285.jpeg

## /montage route
Tile several images together to create a multi-image subject image. Requires at least two images

Params are: w for tile width, mw for max desired width (for the final image)

+ https://imgproc.zooniverse.org/montage?u=panoptes-uploads.zooniverse.org/production/subject_location/90a3b642-55e2-4583-a4fb-2f0abeb5b285.jpeg&u=panoptes-uploads.zooniverse.org/production/subject_location/90a3b642-55e2-4583-a4fb-2f0abeb5b285.jpeg

## Require
Requires [GraphicsMagick](http://www.graphicsmagick.org/) **and** (for now) [ImageMagick](http://imagemagick.org/) CLI tools to be installed:

Debian/Ubuntu:

`apt-get install imagemagick graphicsmagick`

OSX:

`brew install imagemagick` or `port install ImageMagick`

## Install and run
```js
npm install
npm start
#memory issues? defaults to 512mb and 1GB respectively
#limits are 1.4GB in 32-bit node and 4GB in 64-bit node
node --max_old_space_size={size in mb} server.js
```
## Env vars
```
NODE_STATIC_SERVER || "http://zooniverse-static.s3-website-us-east-1.amazonaws.com/"
NODE_PORT || 8080
NODE_ENV || "development"
NODE_DEBUG || false
```

## Notes
  - Uses docker (cron & tmpreaper) to clean up the media in the /img directory. See the docker/static_crop_cron tabfile for more details.

## Credits
Inspired by the good work from Philmod, https://github.com/Philmod/node-resize-image-server
