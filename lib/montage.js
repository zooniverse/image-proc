var Img = require('./image')
  , gm = require('gm')
  , util = require('util')
  , fs = require('fs')
  ;

/**
 * Montage creator - arranges images in a layout/grid
 * @class
 * @param {Array<image>} imgs List of images from which to construct the montage
 */
var Montage = function (imgs) {
  this.imgs = imgs;
};

/**
 * Builds the montage
 * @callback done Called with the path to the montaged file
 */
Montage.prototype.construct = function (done) {
  var outfile = process.cwd()+'/outfile.'+this.imgs[0].extension;
  imageFileNames = this.imgs.map(function (img) {
    return img.url;
  });
  // Start with the first image...
  var g = gm(imageFileNames[0]);
  // ...then add the rest
  imageFileNames.slice(1).forEach(function (imgFileName) {
    g.montage(imgFileName);
  });
  // Write file (@todo figure out why streams don't work with montage)
  g.write(outfile, function (err) {
    done(err, outfile);
  });
};

// Export class
module.exports = Montage;
