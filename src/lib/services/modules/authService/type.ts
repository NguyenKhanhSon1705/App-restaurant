
export interface ILoginPayload {
  email: string,
  password: string
}

export interface IRegisterVerifyPayload {
  email: string
}

export interface ILoginResponse {
  accessToken: string,
  refreshToken: string,
}

// export interface IRegisterPayload {
//   name?: string,
//   email?: string,
//   password?: string,
//   photoUrl?: string,
//   firebaseIdToken?: string,
//   phoneNumber?: string,
//   dateOfBirth?: string,
//   gender?: EGender,
//   language?: string,
// }
