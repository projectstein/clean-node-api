import { SignUpController } from './signup'
import { MissingParamError, InvalidParamError, ServerError } from '../errors'
import { EmailValidator } from '../protocols'
import { AddAccount, addAccountModel } from '../../domain/usecases/add-account'
import { AccountModel } from '../../domain/models/account'

interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
  addAccountStub: AddAccount
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}
const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    add(account: addAccountModel): AccountModel {
      const fakeAccount = {
        id: 'valid_id',
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf'
      }
      return fakeAccount
    }
  }
  return new AddAccountStub()
}

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator()
  const addAccountStub = makeAddAccount()
  const sut = new SignUpController(emailValidatorStub, addAccountStub)
  return { sut, emailValidatorStub, addAccountStub }
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

  test('should return 400 if password confirmation fails', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf',
        passwordConfirmation: 'rgergv'
      }
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(
      new InvalidParamError('passwordConfirmation')
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
        passwordConfirmation: 'wefewf'
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
        passwordConfirmation: 'wefewf'
      }
    }

    sut.handle(httpRequest)

    expect(isValidSpy).toHaveBeenCalledWith('wefewf')
  })

  test('should return 500 if email validator throws', () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf',
        passwordConfirmation: 'wefewf'
      }
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(500)
    expect(httpResponse?.body).toEqual(new ServerError())
  })

  test('should call addAccount with correct values', () => {
    const { sut, addAccountStub } = makeSut()
    const addSpy = jest.spyOn(addAccountStub, 'add')
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf',
        passwordConfirmation: 'wefewf'
      }
    }

    sut.handle(httpRequest)

    expect(addSpy).toHaveBeenCalledWith({
      name: 'ewfwe',
      email: 'wefewf',
      password: 'wefewf'
    })
  })
})
