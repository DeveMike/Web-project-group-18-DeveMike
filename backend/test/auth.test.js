const { expect } = require('chai')

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
})