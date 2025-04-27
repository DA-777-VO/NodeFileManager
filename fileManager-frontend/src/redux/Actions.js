export const loginUser = (userData) => ({
  type: 'LOGIN',
  payload: userData
})

export const logoutUser = () => ({
  type: 'LOGOUT'
})