// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Authsidebar from "./Authsidebar";
import Loginform from "./Loginform";
import Forgetpassword from "./Forgetpassword";
import Account from "./Account";
import { useAuth } from "../../context/AuthContext";
import { fetchRestaurantProfile } from "../../api/Setting";
import StripeService from "../../api/services/Stripeservices";
import { useRestaurant } from "../../context/RestaurantContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setRestaurantId } = useRestaurant();

  const [showForget, setShowForget] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: null });
  const [fieldErrors, setFieldErrors] = useState({});

  // (all your login logic stays untouched)

  return (
    <div
      className="
      min-h-screen
      flex flex-col lg:flex-row  /* mobile = column, desktop = row */
      bg-gray-50
    "
    >
      {/* Sidebar (hidden on mobile) */}
      <Authsidebar />

      {/* Main content */}
      <div className="flex-1 flex justify-center items-center p-6 sm:p-10">
        {showForget ? (
          <Forgetpassword setShowForget={setShowForget} />
        ) : showAccount ? (
          <Account setShowAccount={setShowAccount} />
        ) : (
          <Loginform
            setShowForget={setShowForget}
            setShowAccount={setShowAccount}
            onSubmit={handleLogin}
            loading={loading}
            message={message}
            fieldErrors={fieldErrors}
          />
        )}
      </div>
    </div>
  );
};

export default Login;
