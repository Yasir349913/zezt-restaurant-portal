// src/pages/Account.jsx
import React, { useCallback, useState, useMemo } from "react";
import { registerRestaurantOwner } from "../../api/auth";

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

  const onChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    setMessage((prev) => (prev.text ? { type: null, text: null } : prev));

    setFieldErrors((prev) =>
      prev[name] ? { ...prev, [name]: undefined } : prev
    );
  }, []);

  const onKeyDown = useCallback((e) => {
    if (e.key === "Enter") e.currentTarget.blur();
  }, []);

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
          ...props
        }) => (
          <div className="w-full">
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
                transition duration-200`}
              required={required}
              {...props}
            />

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
              minLength={VALIDATION.firstName.min}
              maxLength={VALIDATION.firstName.max}
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
            minLength={VALIDATION.password.min}
            maxLength={VALIDATION.password.max}
            errorMessage={fieldErrors.password}
          />

          <div className="text-xs text-gray-500">
            Password must be {VALIDATION.password.min}–{VALIDATION.password.max}{" "}
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
            pattern="^[0-9]{10,15}$"
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
          <a
            href="/login"
            className="text-red-500 font-medium hover:text-red-600"
          >
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
