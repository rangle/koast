var fs = require('fs');
var expect = require('chai').expect;
var q = require('q');
var stream = require('stream');
var adminApi = require('../admin-api');
var backup = require('./backup');
var backupHandlers = require('./handlers');

//var mds = require('mongodump-stream');
//var knox = require('knox');
//var q = require('q');
//
////TODO implement me
//
////Testing/debugging utils
////==================================================================================
//
//function printStream(stream) {
//    var d='';
//    stream.on('data', function(c) {
//      d+=c;
//    });
//    stream.on('end', function() {
//      console.log(d);
//    });
//}
//
function compareStreams(str1, str2) {
   var d1 = '', d2 = '', fin = 0;
   var p = q.defer();

   function compare() {
       if(d1.toString() === d2.toString()) {
           p.resolve('streams are identical');
       } else {
           p.reject('streams are NOT identical');
       }
   };

   str2.on('data', function(c) {
       d2+=c;
   }).on('end', function() {
       if(fin++) compare();
   });

   str1.on('data', function(c) {
       d1+=c;
   }).on('end', function() {
       if(fin++) compare();
   });

   return p.promise;
}

var adminConfig = {
  aws: {
    key: process.env.AWS_ACCESS,
    secret: process.env.AWS_SECRET
  },

  local: {
    backupPath: '/tmp/backups/'
  },

  backups: {
    target: 'mongodb://localhost:27017/testing' //Database to backup
  },

  database: { //Database usennpd to store admin metadata
    url: 'mongodb://localhost:27017/koast_db'
  }
};
var adminModule;
var backupPath = adminConfig.local.backupPath;
var testStreamValue = 'test stream data';

function getStream() {
  var s = new stream.Readable();
  s.push(testStreamValue);
  s.push(null);
  return s;
}

function makeFile(path) {
  var s = fs.createWriteStream(path);
  return q.nbind(s.end)(testStreamValue);
}

describe('The filesystem backup handler should work wonderfully', function () {
  var handler;

  before(function() {
    adminModule = adminApi.genKoastModule(adminConfig);
    handler = backupHandlers.filesystemBackupHandler(backupPath);
  });

  it('should generate the expected file path', function () {
    expect(handler._getPath('testname', 'col1')).to.contain('/tmp/backups/testnamecol1');
    expect(handler._getPath('gross/slashes', 'col1')).to.contain('/tmp/backups/grossslashescol1');
    expect(handler._getPath('boring space', 'col1')).to.contain('/tmp/backups/boringspacecol1');
    expect(handler._getPath('☃', 'col1')).to.contain('/tmp/backups/col1');
  });

  it('should put the expected contents in the expected file.', function () {
    var opts = {
      name: 'testname',
      collection: 'col1'
    }

    var testStream = getStream();

    handler.store(testStream, opts)
      .then(function(receipt) {
        q.nfbind(fs.readFile)(receipt.filepath, {encoding: 'utf-8'})
          .then(function(data) {
            expect(data).to.be.equal(testStreamValue);
            fs.unlink(receipt.filepath);  // Cleanup
        }).done();
      });
  });

  it('should retrieve the expected stream content when calling restore', function () {
    var receipt = {
      filepath: '/tmp/backups/testfile.txt'
    };
    makeFile('/tmp/backups/testfile.txt').then(function () {
      handler.restore(receipt)
        .then(function (stream) {
          expect(compareStreams(getStream(), stream)).to.be.true;
        }).done();

    });
  });

  it('should remove the associated file when destroy is called', function () {
    var receipt = {
      filepath: '/tmp/backups/testfile.txt'
    };

    q.nbind(fs.open)('/tmp/backups/testfile.txt', 'w')
      .then(function () {
        expect(fs.existsSync(receipt.filepath)).to.be.true;
        handler.destroy(receipt)
          .then(function () {
            expect(fs.existsSync(receipt.filepath)).to.be.false;
          });
      });
  });
});