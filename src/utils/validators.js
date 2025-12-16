export const VALIDATION = {
  firstName: { min: 2, max: 20 },
  lastName: { min: 2, max: 20 },
  password: { min: 8, max: 20 },
};

export const validateFirstName = (value) => {
  if (!value.trim()) return "First name is required";
  if (value.trim().length < VALIDATION.firstName.min)
    return `First name must be at least ${VALIDATION.firstName.min} characters`;
  if (value.trim().length > VALIDATION.firstName.max)
    return `First name must not exceed ${VALIDATION.firstName.max} characters`;
  if (/\d/.test(value)) return "First name cannot contain numbers";
  if (!/^[a-zA-Z\s'-]+$/.test(value))
    return "First name can only contain letters, spaces, ', and -";
  return "";
};

export const validateLastName = (value) => {
  if (!value.trim()) return "Last name is required";
  if (value.trim().length < VALIDATION.lastName.min)
    return `Last name must be at least ${VALIDATION.lastName.min} characters`;
  if (value.trim().length > VALIDATION.lastName.max)
    return `Last name must not exceed ${VALIDATION.lastName.max} characters`;
  if (/\d/.test(value)) return "Last name cannot contain numbers";
  if (!/^[a-zA-Z\s'-]+$/.test(value))
    return "Last name can only contain letters, spaces, ', and -";
  return "";
};

export const validatePassword = (value) => {
  if (!value) return "Password is required";
  if (value.length < VALIDATION.password.min)
    return `Password must be at least ${VALIDATION.password.min} characters`;
  if (value.length > VALIDATION.password.max)
    return `Password must not exceed ${VALIDATION.password.max} characters`;
  if (!/[A-Z]/.test(value))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(value))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(value)) return "Password must contain at least one number";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
    return "Password must contain at least one special character";
  return "";
};
