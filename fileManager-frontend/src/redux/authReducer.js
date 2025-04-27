// const initialState = {
//   username: null,
//   token: null
// }
//
// export default function authReducer(state = initialState, action) {
//   switch (action.type) {
//   case 'LOGIN':
//     return {
//       ...state,
//       username: action.payload.username,
//       token: action.payload.token
//     }
//   case 'LOGOUT':
//     return initialState
//   default:
//     return state
//   }
// }