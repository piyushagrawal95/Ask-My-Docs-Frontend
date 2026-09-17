export function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
  if (!re.test(email.trim())) {
    return "Please enter a valid email address with a proper domain (e.g. name@example.com).";
  }
  return null;
}

export function validatePassword(password) {
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }
  if (!/\d/.test(password)) {
    return "Password must include at least one digit.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character (e.g. !@#$%).";
  }
  return null;
}

export function getPasswordChecks(password){
  return[
    { label : "At least 6 characters", met:password.length>=6},
    { label : "One uppercase letter", met:/[A-Z]/.test(password)},
    { label :"One lowercase letter", met:/[a-z]/.test(password)},
    { label :"One Digit", met:/\d/.test(password)},
    { label : "One special character",met:/[^A-Za-z0-9]/.test(password)}
  ];
}