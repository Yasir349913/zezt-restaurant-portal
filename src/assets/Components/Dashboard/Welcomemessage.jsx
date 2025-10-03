import React from "react";
import img1 from "../../images/rainy-day.png"

export default function WelcomeMessage() {
  return (
    <div
      className="text-white p-4 sm:p-6 relative rounded-lg w-full overflow-hidden"
      style={{
        minHeight: "120px",
        height: "clamp(120px, 15vh, 153px)",
        background: `linear-gradient(135deg, #E57272 0%, rgba(229, 114, 114, 0.6) 100%)`,
      }}
    >
      {/* Main content container */}
      <div className="relative z-10 flex flex-col justify-center h-full max-w-full">
        {/* Good Morning section */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <h5 className="text-sm sm:text-base md:text-lg font-normal leading-relaxed tracking-tight text-white whitespace-nowrap">
            Good Morning
          </h5>
          <img
            src={img1}
            alt="Good Morning"
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain"
          />
        </div>

        {/* Welcome Back section */}
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight tracking-tight text-white break-words">
          Welcome Back!
        </h1>
      </div>

      {/* Decorative stars - responsive positioning and sizing */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 lg:right-6 text-white opacity-20 flex gap-1 sm:gap-2">
        <svg
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M20 8L24 16H32L26 22L28 32L20 26L12 32L14 22L8 16H16L20 8Z"
            fill="currentColor"
          />
        </svg>
        <svg
          className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M20 8L24 16H32L26 22L28 32L20 26L12 32L14 22L8 16H16L20 8Z"
            fill="currentColor"
          />
        </svg>
        <svg
          className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M20 8L24 16H32L26 22L28 32L20 26L12 32L14 22L8 16H16L20 8Z"
            fill="currentColor"
          />
        </svg>
        <svg
          className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M20 8L24 16H32L26 22L28 32L20 26L12 32L14 22L8 16H16L20 8Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Additional decorative elements for larger screens */}
      <div className="hidden lg:block absolute bottom-4 left-4 text-white opacity-10">
        <svg className="w-12 h-12" viewBox="0 0 40 40" fill="none">
          <path
            d="M20 8L24 16H32L26 22L28 32L20 26L12 32L14 22L8 16H16L20 8Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
