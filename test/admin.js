process.env.TESTENV = true

const bcrypt = require('bcrypt')
const Admin = require('../app/models/admin')

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
chai.should()

chai.use(chaiHttp)

const admin = {
  credentials: {
    email: 'foo@bar.baz',
    password: '12345',
    password_confirmation: '12345'
  }
}

const updatedAdmin = {
  credentials: {
    email: 'foo@bar.baz',
    password: '54321'
  }
}

const nonMatchingPasswordsAdmin = {
  credentials: {
    email: 'dont@type.good',
    password: '12345',
    password_confirmation: '54321'
  }
}

let token = 'notrealtoken'

describe('Admins', () => {
  beforeEach(done => {
    Admin.deleteMany({})
      .then(() => bcrypt.hash(admin.credentials.password, 10))
      .then(hash => {
        return {
          email: admin.credentials.email,
          hashedPassword: hash,
          token
        }
      })
      .then(pojo => Admin.create(pojo))
      .then(() => done())
      .catch(() => done())
  })

  after(done => {
    Admin.deleteMany({})
      .then(() => done())
      .catch(() => done())
  })

  describe('POST /sign-up', () => {
    it('should reject users with duplicate emails', done => {
      chai.request(server)
        .post('/sign-up')
        .send(admin)
        .end((e, res) => {
          res.should.have.status(422)
          done()
        })
    })

    it('should reject an empty string password', done => {
      chai.request(server)
        .post('/sign-up')
        .send(Object.assign({}, admin.credentials, { password: '', password_confirmation: '' }))
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          res.body.should.have.property('name')
          done()
        })
    })

    it('should reject users with non-matching passwords', done => {
      chai.request(server)
        .post('/sign-up')
        .send(nonMatchingPasswordsAdmin)
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          res.body.should.have.property('name')
          done()
        })
    })

    it('should create a user if params are valid', done => {
      Admin.deleteMany({})
        .then(() => {
          chai.request(server)
            .post('/sign-up')
            .send(admin)
            .end((e, res) => {
              res.should.have.status(201)
              res.should.be.a('object')
              res.body.should.have.property('admin')
              res.body.admin.should.have.property('email').eql(admin.credentials.email)
              done()
            })
        })
        .catch(() => done())
    })
  })

  describe('POST /sign-in', () => {
    it('should return a token when given valid credentials', done => {
      chai.request(server)
        .post('/sign-in')
        .send(admin)
        .end((e, res) => {
          res.should.have.status(201)
          res.should.be.a('object')
          res.body.should.have.property('admin')
          res.body.admin.should.be.a('object')
          res.body.admin.should.have.property('token')
          res.body.admin.token.should.be.a('string')
          done()
        })
    })

    it('the token should allow you to GET /examples', done => {
      chai.request(server)
        .get('/examples')
        .set('Authorization', `Token token=${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.should.have.property('examples')
          res.body.examples.should.be.a('array')
          done()
        })
    })
  })

  describe('PATCH /change-password', () => {
    const changePwParams = {
      passwords: {
        old: admin.credentials.password,
        new: '54321'
      }
    }

    const badChangePwParams = {
      passwords: {
        old: 'WRONG',
        new: '54321'
      }
    }

    it('fails when the wrong password is provided', done => {
      chai.request(server)
        .patch('/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(badChangePwParams)
        .end((e, res) => {
          res.should.have.status(422)
          done()
        })
    })

    it('fails when the new password is an empty string', done => {
      chai.request(server)
        .patch('/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ passwords: { old: '54321', new: '' } })
        .end((e, res) => {
          res.should.have.status(422)
          done()
        })
    })

    it('is successful and changes the password', done => {
      chai.request(server)
        .patch('/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(changePwParams)
        .end((e, res) => {
          res.should.have.status(204)
          chai.request(server)
            .post('/sign-in')
            .send(updatedAdmin)
            .end((e, res) => {
              res.should.have.status(201)
              res.body.admin.should.have.property('token')
              res.body.admin.token.should.be.a('string')
              done()
            })
        })
    })
  })

  describe('DELETE /sign-out', () => {
    it('returns 204', done => {
      chai.request(server)
        .delete('/sign-out')
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.status.should.eql(204)
          done()
        })
    })
  })
})
