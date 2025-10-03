// src/pages/Account.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { registerRestaurantOwner } from "../../api/auth";

// Form validation rules
const VALIDATION = {
  firstName: { min: 3, max: 20 },
  lastName: { min: 3, max: 20 },
  password: { min: 8, max: 20 },
};

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
};

export default function Account() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: null });
  const [fieldErrors, setFieldErrors] = useState({});

  // Handle input changes - optimized with useCallback
  const onChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({ ...prevForm, [name]: value }));

    // Clear UI messages for the edited field
    setMessage((prevMessage) =>
      prevMessage.text ? { type: null, text: null } : prevMessage
    );

    setFieldErrors((prevErrors) =>
      prevErrors[name] ? { ...prevErrors, [name]: undefined } : prevErrors
    );
  }, []);

  // Optional: avoid IME/fast-enter edge-case on submit - optimized
  const onKeyDown = useCallback((e) => {
    if (e.key === "Enter") e.currentTarget.blur();
  }, []);

  // Client-side validation - optimized with useCallback
  const validateForm = useCallback(() => {
    const errors = {};

    if (form.firstName.trim().length < VALIDATION.firstName.min) {
      errors.firstName = `First name must be at least ${VALIDATION.firstName.min} characters`;
    }
    if (form.lastName.trim().length < VALIDATION.lastName.min) {
      errors.lastName = `Last name must be at least ${VALIDATION.lastName.min} characters`;
    }
    if (form.password.length < VALIDATION.password.min) {
      errors.password = `Password must be at least ${VALIDATION.password.min} characters`;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!form.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  // Error normalization helper - memoized
  const normalizeError = useCallback((err) => {
    const data = err || {};
    if (data.error) return { message: data.error }; // { error: "..." }
    if (data.message) return { message: data.message }; // { message: "..." }
    if (data.errors) {
      const fields = {};
      for (const [k, v] of Object.entries(data.errors)) {
        fields[k] = Array.isArray(v) ? v[0] : String(v);
      }
      return { message: "Validation error", fields };
    }
    return { message: "Something went wrong" };
  }, []);

  // Handle form submission - optimized
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
          text: `Account created successfully for ${
            user?.firstName || "you"
          }! Welcome aboard.`,
        });
        setForm(initial); // only reset on success
        // TODO: navigate("/login") or dashboard
      } catch (e) {
        const err = normalizeError(e);
        if (err.fields) setFieldErrors(err.fields);
        setMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    },
    [form, validateForm, normalizeError]
  );

  // Message component - memoized
  const Message = useMemo(
    () =>
      ({ type, text }) => {
        if (!text) return null;

        const styles = {
          success: "text-green-800 bg-green-50 border-green-200",
          error: "text-red-800 bg-red-50 border-red-200",
        };

        const Icon = () =>
          type === "success" ? (
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          );

        return (
          <div
            className={`mb-4 p-3 border rounded-lg flex items-start ${styles[type]}`}
          >
            <Icon />
            <span className="text-sm font-medium">{text}</span>
          </div>
        );
      },
    []
  );

  // Input field component - memoized to prevent re-renders
  const InputField = useMemo(
    () =>
      React.memo(
        ({
          label,
          name,
          type = "text",
          placeholder,
          required = true,
          value = "",
          onChange,
          onKeyDown,
          errorMessage,
          ...props
        }) => (
          <div>
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={name}
              name={name}
              type={type}
              value={value ?? ""} // safe fallback
              onChange={onChange}
              onKeyDown={onKeyDown}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 ${
                errorMessage
                  ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
              }`}
              placeholder={placeholder}
              required={required}
              {...props}
            />
            {errorMessage && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMessage}
              </p>
            )}
          </div>
        )
      ),
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h2>
          <p className="text-sm text-gray-600">
            Join as a restaurant owner and start your journey
          </p>
        </div>

        <Message type={message.type} text={message.text} />

        {/* Form with optimized event handlers */}
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              name="firstName"
              placeholder="John"
              value={form.firstName}
              onChange={onChange}
              onKeyDown={onKeyDown}
              minLength={VALIDATION.firstName.min}
              maxLength={VALIDATION.firstName.max}
              autoComplete="given-name"
              errorMessage={fieldErrors.firstName}
            />
            <InputField
              label="Last Name"
              name="lastName"
              placeholder="Doe"
              value={form.lastName}
              onChange={onChange}
              onKeyDown={onKeyDown}
              minLength={VALIDATION.lastName.min}
              maxLength={VALIDATION.lastName.max}
              autoComplete="family-name"
              errorMessage={fieldErrors.lastName}
            />
          </div>

          <InputField
            label="Email Address"
            name="email"
            type="email"
            placeholder="john.doe@example.com"
            value={form.email}
            onChange={onChange}
            onKeyDown={onKeyDown}
            autoComplete="email"
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
            minLength={VALIDATION.password.min}
            maxLength={VALIDATION.password.max}
            autoComplete="new-password"
            errorMessage={fieldErrors.password}
          />
          <div className="text-xs text-gray-500">
            Password must be {VALIDATION.password.min}-{VALIDATION.password.max}{" "}
            characters long
          </div>

          <InputField
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            placeholder="03001234567"
            value={form.phoneNumber}
            onChange={onChange}
            onKeyDown={onKeyDown}
            autoComplete="tel"
            pattern="^[0-9]{10,15}$"
            errorMessage={fieldErrors.phoneNumber}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 shadow-md hover:shadow-lg"
            aria-busy={loading ? "true" : "false"}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-red-500 hover:text-red-600 transition-colors duration-200"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
