import React from "react";
const Authsidebar = () => {
  return (
    <div className="w-[700px] bg-gradient-to-br from-[#FF9A8B] to-[#FFA8A8] flex flex-col justify-center items-start p-12 relative overflow-hidden ">
      <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full"></div>
      <div className="absolute bottom-32 right-10 w-20 h-20 bg-white/10 rounded-full"></div>
      <div className="absolute top-40 left-10 w-16 h-16 bg-white/10 rounded-full"></div>

      <div className="max-w-sm text-white relative z-10">
        <h1 className="text-4xl font-bold mb-6 leading-tight">
          Run your restaurant smarter with everything in one place.
        </h1>
        {/* <p className="text-base text-white/90 mb-8 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
          at.
        </p> */}

        {/* Dots indicator */}
        <div className="flex space-x-3">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <div className="w-3 h-3 bg-white/40 rounded-full"></div>
          <div className="w-3 h-3 bg-white/40 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Authsidebar;
