import { SignUpController } from './signup'
import { MissingParamError } from '../errors/missing-param-error'

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

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(new MissingParamError('name'))
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

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(new MissingParamError('email'))
  })

  test('should return 400 if no password is provided ', () => {
    const signUp = new SignUpController()
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        passwordConfirmation: 'efwfe'
      }
    }

    const httpResponse = signUp.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(new MissingParamError('password'))
  })

  test('should return 400 if no password confirmation when password is provided ', () => {
    const signUp = new SignUpController()
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf'
      }
    }

    const httpResponse = signUp.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(
      new MissingParamError('passwordConfirmation')
    )
  })
})
