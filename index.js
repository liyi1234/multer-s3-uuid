var S3FS = require('s3fs');
var crypto = require('crypto');
var path = require('path');
var options = {};
var s3fs;
function S3Storage (opts) {
  if (!opts.bucket) throw new Error('bucket is required');
  if (!opts.secretAccessKey) throw new Error('secretAccessKey is required');
  if (!opts.accessKeyId) throw new Error('accessKeyId is required');
  if (!opts.region) throw new Error('region is required');
  if (!opts.dirname) throw new Error('dirname is required');
  options = opts;
  s3fs = new S3FS(options.bucket, options);
}

S3Storage.prototype._handleFile = function (req, file, cb) {
  var fileName = req.session.auth.uuid;
  var dirname = req.path.split('/');
  dirname.shift();
  dirname.shift();
  dirname.push(fileName);
  var outStream = s3fs.createWriteStream(dirname.join('/'));
  file.stream.pipe(outStream);
  outStream.on('error', cb);
  outStream.on('finish', function(){
    cb(null, {size: outStream.bytesWritten, key: options.dirname + '/' + fileName})
  });
}

S3Storage.prototype._removeFile = function (req, file, cb) {
  s3fs.unlink(file.path, cb)
}

module.exports = function (opts) {
  return new S3Storage(opts)
}
