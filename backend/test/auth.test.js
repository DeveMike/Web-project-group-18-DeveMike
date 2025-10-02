import { expect } from 'chai'

describe('Auth API tests', function () {
  const apiUrl = 'http://localhost:3001/api/auth/'

  let token = ''
  const email = `test_${Date.now()}@e.com`
  const password = 'Salasana1'

  function postOptions(body) {
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  }

  it('should register a new user', async function () {
    const res = await fetch(apiUrl + 'register/', postOptions({ email, password }))
    expect(res.status).to.equal(201)
    const data = await res.json()
    expect(data).to.have.property('token')
    token = data.token
  })

  it('should fail to register with existing email', async function () {
    const res = await fetch(apiUrl + 'register/', postOptions({ email, password }))
    expect(res.status).to.equal(409)
  })

  it('should login with correct credentials', async function () {
    const res = await fetch(apiUrl + 'login/', postOptions({ email, password }))
    expect(res.status).to.equal(200)
    const data = await res.json()
    expect(data).to.have.property('token')
  })

  it('should fail login with wrong password', async function () {
    const res = await fetch(apiUrl + 'login/', postOptions({ email, password: 'Wrong123' }))
    expect(res.status).to.equal(401)
  })

  it('should logout successfully', async function () {
    const res = await fetch(apiUrl + 'logout/', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token }
    })
    expect([200, 204]).to.include(res.status)
    const data = await res.json()
    expect(data).to.have.property('message')
  })

  it('should delete the account', async function () {
    const res = await fetch(apiUrl + 'delete-account/', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    })
    expect([200, 204]).to.include(res.status)
    const data = await res.json()
    expect(data).to.have.property('deletedEmail')
    expect(data.deletedEmail).to.equal(email)
  })

    it('should not login after account deletion', async function () {
    const res = await fetch(apiUrl + 'login/', postOptions({ email, password }))
    expect(res.status).to.equal(401)
  })
})