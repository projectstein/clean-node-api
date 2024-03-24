import { SignUpController } from './signup'

describe('Signup Controller', () => {
  test('should return 400 if no name is provided ', () => {
    const signUp = new SignUpController()
    const httpRequest = {
      email: '',
      password: '',
      passwordConfirmation: ''
    }
    const httpResponse = signUp.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
  })
})
