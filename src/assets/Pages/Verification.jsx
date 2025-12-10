// src/components/Verification.jsx
import React, { useRef, useState } from "react";
import Reset from "./Reset";
import { verifyEmail, resendCode } from "../../api/auth";

const DIGITS = 6;

const Verification = ({ email, onCancel }) => {
  const [code, setCode] = useState(Array(DIGITS).fill(""));
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [message, setMessage] = useState({ type: null, text: null });
  const [showReset, setShowReset] = useState(false);

  const inputsRef = useRef([]);

  const focusInput = (i) => inputsRef.current[i]?.focus();

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);
    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < DIGITS - 1) focusInput(index + 1);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (code[index]) {
        const next = [...code];
        next[index] = "";
        setCode(next);
      } else if (index > 0) focusInput(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) focusInput(index - 1);
    if (e.key === "ArrowRight" && index < DIGITS - 1) focusInput(index + 1);
  };

  const handlePaste = (e) => {
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, DIGITS)
      .split("");
    if (!digits.length) return;
    const next = Array(DIGITS).fill("");
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setCode(next);
    const focusIdx = Math.min(digits.length, DIGITS - 1);
    focusInput(focusIdx);
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: null });

    const entered = code.join("");
    if (entered.length !== DIGITS) {
      setMessage({
        type: "error",
        text: `Please enter the ${DIGITS}-digit code.`,
      });
      return;
    }
    if (!email) {
      setMessage({
        type: "error",
        text: "Email is missing. Go back and enter your email again.",
      });
      return;
    }

    try {
      setLoadingVerify(true);
      const res = await verifyEmail({ email, code: Number(entered) });
      const okMsg = res?.message || "Code verified successfully.";
      setMessage({ type: "success", text: okMsg });
      setShowReset(true);
    } catch (err) {
      const data = err?.response?.data || err || {};
      const errText = data.error || data.message || "Invalid or expired code.";
      setMessage({ type: "error", text: errText });
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResend = async () => {
    setMessage({ type: null, text: null });
    if (!email) {
      setMessage({
        type: "error",
        text: "Email is missing. Go back and enter your email again.",
      });
      return;
    }
    try {
      setLoadingResend(true);
      const res = await resendCode({ email });
      const okMsg = res?.message || "A new verification code has been sent.";
      setMessage({ type: "success", text: okMsg });
      setCode(Array(DIGITS).fill(""));
      focusInput(0);
    } catch (err) {
      const data = err?.response?.data || err || {};
      const errText =
        data.error || data.message || "Could not resend code. Try again.";
      setMessage({ type: "error", text: errText });
    } finally {
      setLoadingResend(false);
    }
  };

  if (showReset) return <Reset email={email} />;

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 md:px-0 bg-gray-50">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg rounded-lg p-6 sm:p-8 bg-white shadow-md">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900 text-center">
          Enter Verification Code
        </h2>
        <p className="text-sm sm:text-base text-gray-500 mb-6 text-center">
          Enter 6-Digit Code to retrieve your password
        </p>

        {message?.text && (
          <div
            className={`mb-4 rounded-md px-3 py-2 text-sm sm:text-base ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 sm:gap-4 mb-6 flex-wrap">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-10 h-10 sm:w-12 sm:h-12 text-center border border-gray-300 rounded-md text-lg sm:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <p className="text-sm sm:text-base text-gray-500 text-center mb-6">
            Didn’t receive a code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={loadingResend}
              className="text-red-500 font-medium hover:text-red-600 disabled:opacity-60"
            >
              {loadingResend ? "Resending..." : "Resend"}
            </button>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => (onCancel ? onCancel() : window.history.back())}
              className="w-full sm:w-1/2 border border-gray-300 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700"
              disabled={loadingVerify || loadingResend}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loadingVerify || loadingResend}
              className="w-full sm:w-1/2 bg-[#EB5757] text-white py-2.5 rounded-md text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
            >
              {loadingVerify ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Verification;
