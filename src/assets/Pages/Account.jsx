import React, { useCallback, useState, useMemo } from "react";
import { registerRestaurantOwner } from "../../api/auth";
import {
  validateFirstName,
  validateLastName,
  validatePassword,
} from "../../utils/validators";

const VALIDATION = {
  phone: { min: 10, max: 15 },
};

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
};

export default function Account({ setShowAccount }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: null });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage((prev) => (prev.text ? { type: null, text: null } : prev));
    setFieldErrors((prev) =>
      prev[name] ? { ...prev, [name]: undefined } : prev
    );

    validateField(name, value);
  }, []);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
        error = validateFirstName(value);
        break;
      case "lastName":
        error = validateLastName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "phoneNumber":
        error = validatePhoneNumber(value);
        break;
      default:
        break;
    }

    if (error) {
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  };

  const validatePhoneNumber = (value) => {
    if (!value.trim()) return "Phone number is required";
    const cleanPhone = value.replace(/[\s\-()]/g, "");
    if (!/^[\+]?[0-9]+$/.test(cleanPhone))
      return "Phone number can only contain digits, +, -, (), and spaces";
    if (cleanPhone.length < VALIDATION.phone.min)
      return `Phone number must be at least ${VALIDATION.phone.min} digits`;
    if (cleanPhone.length > VALIDATION.phone.max)
      return `Phone number must not exceed ${VALIDATION.phone.max} digits`;
    return "";
  };

  const onKeyDown = useCallback((e) => {
    if (e.key === "Enter") e.currentTarget.blur();
  }, []);

  const validateForm = useCallback(() => {
    const errors = {
      firstName: validateFirstName(form.firstName),
      lastName: validateLastName(form.lastName),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      phoneNumber: validatePhoneNumber(form.phoneNumber),
    };

    setFieldErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  }, [form]);

  const normalizeError = useCallback((err) => {
    const data = err || {};
    if (data.error) return { message: data.error };
    if (data.message) return { message: data.message };
    if (data.errors) {
      const fields = {};
      for (const [key, val] of Object.entries(data.errors)) {
        fields[key] = Array.isArray(val) ? val[0] : String(val);
      }
      return { message: "Validation error", fields };
    }
    return { message: "Something went wrong" };
  }, []);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        setMessage({ type: "error", text: "Please fix the errors below" });
        return;
      }

      setLoading(true);
      setMessage({ type: null, text: null });
      setFieldErrors({});

      try {
        const user = await registerRestaurantOwner(form);
        setMessage({
          type: "success",
          text: `Account created successfully for ${user?.firstName || "you"}!`,
        });
        setForm(initial);

        // Redirect to login page after 1.5 seconds
        setTimeout(() => {
          if (setShowAccount) {
            setShowAccount(false);
          }
        }, 1500);
      } catch (e) {
        const err = normalizeError(e);
        if (err.fields) setFieldErrors(err.fields);
        setMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    },
    [form, validateForm, normalizeError, setShowAccount]
  );

  const Message = useMemo(
    () =>
      ({ type, text }) => {
        if (!text) return null;

        const styles = {
          success: "text-green-800 bg-green-50 border-green-200",
          error: "text-red-800 bg-red-50 border-red-200",
        };

        return (
          <div
            className={`mb-4 p-3 border rounded-lg flex items-start gap-2 ${styles[type]}`}
          >
            <span className="text-sm font-medium">{text}</span>
          </div>
        );
      },
    []
  );

  const InputField = useMemo(
    () =>
      React.memo(
        ({
          label,
          name,
          type = "text",
          placeholder,
          value,
          onChange,
          onKeyDown,
          errorMessage,
          required = true,
          showPasswordToggle = false,
          showPassword = false,
          onTogglePassword,
          ...props
        }) => (
          <div className="w-full">
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                id={name}
                name={name}
                type={showPasswordToggle && showPassword ? "text" : type}
                value={value ?? ""}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className={`w-full px-3 py-3 text-sm rounded-lg border 
                  ${
                    errorMessage
                      ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                  } 
                  transition duration-200 ${showPasswordToggle ? "pr-10" : ""}`}
                required={required}
                {...props}
              />
              {showPasswordToggle && (
                <button
                  type="button"
                  onClick={onTogglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
            {errorMessage && (
              <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
            )}
          </div>
        )
      ),
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Create Your Account
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Join as a restaurant owner
          </p>
        </div>

        <Message type={message.type} text={message.text} />

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              name="firstName"
              placeholder="John"
              value={form.firstName}
              onChange={onChange}
              onKeyDown={onKeyDown}
              errorMessage={fieldErrors.firstName}
            />

            <InputField
              label="Last Name"
              name="lastName"
              placeholder="Doe"
              value={form.lastName}
              onChange={onChange}
              onKeyDown={onKeyDown}
              errorMessage={fieldErrors.lastName}
            />
          </div>

          <InputField
            label="Email Address"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={onChange}
            onKeyDown={onKeyDown}
            errorMessage={fieldErrors.email}
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter a strong password"
            value={form.password}
            onChange={onChange}
            onKeyDown={onKeyDown}
            errorMessage={fieldErrors.password}
            showPasswordToggle={true}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <InputField
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            placeholder="+92 300 1234567"
            value={form.phoneNumber}
            onChange={onChange}
            onKeyDown={onKeyDown}
            errorMessage={fieldErrors.phoneNumber}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-lg"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => setShowAccount && setShowAccount(false)}
            className="text-red-500 font-medium hover:text-red-600"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
