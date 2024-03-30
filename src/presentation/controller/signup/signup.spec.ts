import { SignUpController } from './signup'
import { MissingParamError, InvalidParamError, ServerError } from '../../errors'
import {
  EmailValidator,
  AddAccount,
  AccountModel,
  addAccountModel
} from './signup-protocols'

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
    async add(account: addAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf'
      }
      return await new Promise((resolve) => {
        resolve(fakeAccount)
      })
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
  test('should return 400 if no name is provided ', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'wefewf',
        password: 'wefewf',
        passwordConfirmation: 'wfewfwe'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(new MissingParamError('name'))
  })

  test('should return 400 if no email is provided ', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'ewfwe',
        password: 'wefwef',
        passwordConfirmation: 'efwfe'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(new MissingParamError('email'))
  })

  test('should return 400 if no password is provided ', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        passwordConfirmation: 'efwfe'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(new MissingParamError('password'))
  })

  test('should return 400 if no password confirmation when password is provided ', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(
      new MissingParamError('passwordConfirmation')
    )
  })

  test('should return 400 if password confirmation fails', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf',
        passwordConfirmation: 'rgergv'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(
      new InvalidParamError('passwordConfirmation')
    )
  })

  test('should return 400 if invalid email is provided', async () => {
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

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(400)
    expect(httpResponse?.body).toEqual(new InvalidParamError('email'))
  })

  test('should call emailValidator with correct email ', async () => {
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

    await sut.handle(httpRequest)

    expect(isValidSpy).toHaveBeenCalledWith('wefewf')
  })

  test('should return 500 if email validator throws', async () => {
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

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(500)
    expect(httpResponse?.body).toEqual(new ServerError())
  })

  test('should call addAccount with correct values', async () => {
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

    await sut.handle(httpRequest)

    expect(addSpy).toHaveBeenCalledWith({
      name: 'ewfwe',
      email: 'wefewf',
      password: 'wefewf'
    })
  })

  test('should return 500 if addAccount throws', async () => {
    const { sut, addAccountStub } = makeSut()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => {
        reject(new Error())
      })
    })
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf',
        passwordConfirmation: 'wefewf'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(500)
    expect(httpResponse?.body).toEqual(new ServerError())
  })

  test('should return 200 if valid data is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'ewfwe',
        email: 'wefewf',
        password: 'wefewf',
        passwordConfirmation: 'wefewf'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse?.statusCode).toBe(200)
    expect(httpResponse?.body).toStrictEqual({
      id: 'valid_id',
      name: 'ewfwe',
      email: 'wefewf',
      password: 'wefewf'
    })
  })
})
