import { SignUpController } from './signup'
import { MissingParamError, InvalidParamError, ServerError } from '../errors'
import { EmailValidator } from '../protocols'

interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
}

const makeSut = (): SutTypes => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true
    }
  }
  const emailValidatorStub = new EmailValidatorStub()
  const sut = new SignUpController(emailValidatorStub)
  return { sut, emailValidatorStub }
}

describe('Signup Controller', () => {
  test('should return 400 if no name is provided ', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'wefewf',
        password: 'wefewf',
        passwordConfirmation: 'wfewfwe'
      }
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(new MissingParamError('name'))
  })

  test('should return 400 if no email is provided ', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'ewfwe',
        password: 'wefwef',
        passwordConfirmation: 'efwfe'
      }
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(new MissingParamError('email'))
  })

  test('should return 400 if no password is provided ', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        passwordConfirmation: 'efwfe'
      }
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(new MissingParamError('password'))
  })

  test('should return 400 if no password confirmation when password is provided ', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf'
      }
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(
      new MissingParamError('passwordConfirmation')
    )
  })
  test('should return 400 if invalid email is provided', () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf',
        passwordConfirmation: 'wfewfwe'
      }
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(new InvalidParamError('email'))
  })

  test('should call emailValidator with correct email ', () => {
    const { sut, emailValidatorStub } = makeSut()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf',
        passwordConfirmation: 'wfewfwe'
      }
    }

    sut.handle(httpRequest)

    expect(isValidSpy).toHaveBeenCalledWith('wefewf')
  })

  test('should return 500 if email validator throws', () => {
    class EmailValidatorStub implements EmailValidator {
      isValid(email: string): boolean {
        throw new Error()
      }
    }
    const emailValidatorStub = new EmailValidatorStub()
    const sut = new SignUpController(emailValidatorStub)
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf',
        passwordConfirmation: 'wfewfwe'
      }
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(500)
    expect(httpResponse?.body).toEqual(new ServerError())
  })
})
