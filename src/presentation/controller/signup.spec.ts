import { SignUpController } from './signup'

describe('Signup Controller', () => {
  test('should return 400 if no name is provided ', () => {
    const signUp = new SignUpController()
    const httpRequest = {
      body: {
        email: 'wefewf',
        password: 'wefewf',
        passwordConfirmation: 'wfewfwe'
      }
    }

    const httpResponse = signUp.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new Error('Missing param: name'))
  })

  test('should return 400 if no email is provided ', () => {
    const signUp = new SignUpController()
    const httpRequest = {
      body: {
        name: 'ewfwe',
        password: 'wefwef',
        passwordConfirmation: 'efwfe'
      }
    }

    const httpResponse = signUp.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new Error('Missing param: email'))
  })
})
