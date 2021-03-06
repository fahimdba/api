var sinon = require('sinon')
var should = require('should')
var request = require('supertest')
var connection = require(__dirname + '/../../dadi/lib/model/connection')
var model = require(__dirname + '/../../dadi/lib/model')
var help = require(__dirname + '/../../dadi/lib/help')
var config = require(__dirname + '/../../config')

describe('Model', function () {
  beforeEach(function (done) {
    connection.resetConnections()
    done()
  })

  it('should connect to the specified database', function (done) {
    var dbConfig = {
      'hosts': [
        {
          'host': '127.0.0.1',
          'port': 27017
        }
      ],
      'username': '',
      'password': '',
      'database': 'test',
      'ssl': false,
      'replicaSet': '',
      'enableCollectionDatabases': true,
      'secondary': {
        'hosts': [
          {
            'host': '127.0.0.1',
            'port': 27017
          }
        ],
        'username': '',
        'password': '',
        'replicaSet': '',
        'ssl': false
      }
    }

    var loggingConfig = config.get('logging')

    var configStub = sinon.stub(config, 'get')
    configStub.withArgs('database').returns(dbConfig)
    configStub.withArgs('logging').returns(loggingConfig)

    var schema = require(__dirname + '/workspace/secondary-db/vtest/secondary/collection.secondary-schema.json')

    var mod = model('secondary-schema', help.getFieldsFromSchema(schema), null, schema.settings, 'secondary')
    var conn = mod.connection

    conn.connectionOptions.database.should.equal('secondary')
    conn.connectionOptions.hosts.should.be.Array
    conn.connectionOptions.hosts.length.should.equal(1)
    conn.connectionOptions.hosts[0].host.should.equal('127.0.0.1')
    conn.connectionOptions.hosts[0].port.should.equal(27017)

    configStub.restore()

    done()
  })

  it('should connect to primary database if collection databases are disabled', function (done) {
    var dbConfig = {
      'hosts': [
        {
          'host': '127.0.0.1',
          'port': 27017
        }
      ],
      'username': '',
      'password': '',
      'database': 'test',
      'ssl': false,
      'replicaSet': '',
      'enableCollectionDatabases': false,
      'secondary': {
        'hosts': [
          {
            'host': '127.0.0.1',
            'port': 27018
          }
        ],
        'username': '',
        'password': '',
        'replicaSet': '',
        'ssl': false
      }
    }

    var loggingConfig = config.get('logging')

    var configStub = sinon.stub(config, 'get')
    configStub.withArgs('database').returns(dbConfig)
    configStub.withArgs('logging').returns(loggingConfig)

    var schema = require(__dirname + '/workspace/secondary-db/vtest/secondary/collection.secondary-schema.json')

    var mod = model('secondary-schema', help.getFieldsFromSchema(schema), null, schema.settings, 'secondary')
    configStub.restore()

    var conn = mod.connection

    conn.connectionOptions.database.should.equal('test')

    done()
  })

  it('should use primary database host and credentials if none supplied for secondary database', function (done) {
    var dbConfig = {
      'hosts': [
        {
          'host': '127.0.0.1',
          'port': 27017
        }
      ],
      'username': 'seramatest',
      'password': 'serama123',
      'database': 'test',
      'ssl': false,
      'replicaSet': '',
      'enableCollectionDatabases': true,
      'secondary': {
        'hosts': [
          {
            'host': '127.0.0.1',
            'port': 27017
          }
        ],
        'replicaSet': false,
        'ssl': false
      }
    }

    var loggingConfig = config.get('logging')

    var configStub = sinon.stub(config, 'get')
    configStub.withArgs('database').returns(dbConfig)
    configStub.withArgs('logging').returns(loggingConfig)

    var schema = require(__dirname + '/workspace/secondary-db/vtest/secondary/collection.secondary-schema.json')

    var mod = model('secondary-schema', help.getFieldsFromSchema(schema), null, schema.settings, 'secondary')

    configStub.restore()

    var conn = mod.connection
    conn.connectionString.should.equal('mongodb://seramatest:serama123@127.0.0.1:27017/secondary')

    done()
  })

  it('should use primary database host and credentials if none supplied for secondary database', function (done) {
    var dbConfig = {
      'hosts': [
        {
          'host': '127.0.0.1',
          'port': 27017
        }
      ],
      'username': 'seramatest',
      'password': 'serama123',
      'database': 'test',
      'ssl': false,
      'replicaSet': '',
      'enableCollectionDatabases': true,
      'secondary': {

      }
    }

    var loggingConfig = config.get('logging')

    var configStub = sinon.stub(config, 'get')
    configStub.withArgs('database').returns(dbConfig)
    configStub.withArgs('logging').returns(loggingConfig)

    var schema = require(__dirname + '/workspace/secondary-db/vtest/secondary/collection.secondary-schema.json')

    var mod = model('secondary-schema', help.getFieldsFromSchema(schema), null, schema.settings, 'secondary')
    configStub.restore()

    var conn = mod.connection

    conn.connectionString.should.equal('mongodb://seramatest:serama123@127.0.0.1:27017/secondary')

    done()
  })

  it('should use specified database host and credentials if supplied', function (done) {
    var dbConfig = {
      'hosts': [
        {
          'host': '127.0.0.1',
          'port': 27017
        }
      ],
      'username': '',
      'password': '',
      'database': 'test',
      'ssl': false,
      'replicaSet': '',
      'enableCollectionDatabases': true,
      'secondary': {
        'hosts': [
          {
            'host': '127.0.0.1',
            'port': 27016
          }
        ],
        'username': 'test',
        'password': '123'
      }
    }

    var loggingConfig = config.get('logging')

    var configStub = sinon.stub(config, 'get')
    configStub.withArgs('database').returns(dbConfig)
    configStub.withArgs('logging').returns(loggingConfig)

    var schema = require(__dirname + '/workspace/secondary-db/vtest/secondary/collection.secondary-schema.json')

    var mod = model('secondary-schema', help.getFieldsFromSchema(schema), null, schema.settings, 'secondary')
    configStub.restore()
    var conn = mod.connection

    conn.connectionString.should.equal('mongodb://test:123@127.0.0.1:27016/secondary')

    done()
  })

})
