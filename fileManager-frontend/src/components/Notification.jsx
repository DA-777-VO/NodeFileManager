const Notification = ({ errorMessage, successMessage }) => {

  const error = {
    color: 'red',
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px',
  }

  const success = {
    color: 'green',
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px',
  }

  if (successMessage === null && errorMessage === null) {
    return null
  } else if (successMessage){
    return (
      <div id='success' style={success}>
        {successMessage}
      </div>
    )
  } else {
    return (
      <div id='error' style={error}>
        {errorMessage}
      </div>
    )
  }
}

export default Notification