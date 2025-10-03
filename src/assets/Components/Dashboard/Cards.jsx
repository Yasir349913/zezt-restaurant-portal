import React from "react";

const Cards = ({ name, number, percentage }) => {
  return (
    <div className="bg-white rounded-lg flex flex-col justify-between border border-gray-100 p-4 h-[117px]">
      {/* Header with title and percentage */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-[13.26px] leading-[18.94px] font-normal text-black">
          {name}
        </span>
      </div>

      {/* Main number */}
      <div className="flex justify-between items-center w-[184.63px] h-[34.09px] rounded-[7.57px]">
        <span className="text-gray-900 text-[20px] font-semibold leading-[24px]">
          {number}
        </span>
      </div>

      {/* Bottom text */}
      <div className="mt-[1px]">
        <span className="text-gray-400 text-[9.02px] font-normal">
          +{percentage}% vs last month
        </span>
      </div>
    </div>
  );
};

export default Cards;
