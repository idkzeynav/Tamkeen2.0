import React from "react";
import { motion } from "framer-motion";

const CheckoutSteps = ({ active }) => {
  const stepClasses = (isActive) =>
    `relative flex flex-col items-center justify-center ${
      isActive ? "text-[#5a4336]" : "text-[#a67d6d] opacity-100"
    }`;

  const barClasses = (isActive) =>
    `h-1 w-[30px] 800px:w-[70px] rounded-full transition-all duration-300 ${
      isActive ? "bg-gradient-to-r from-[#5a4336] to-[#a67d6d]" : "bg-[#FDE1E6]"
    }`;

  const stepNumberClasses = (isActive) =>
    `w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
      isActive
        ? "bg-gradient-to-r from-[#5a4336] to-[#a67d6d] text-white shadow-md hover:scale-105 hover:shadow-lg transition-all"
        : "bg-[#FDE1E6] text-[#a67d6d] cursor-not-allowed"
    }`;

  const textClasses = (isActive) =>
    `mt-2 text-sm font-medium ${
      isActive ? "text-[#5a4336]" : "text-[#a67d6d] opacity-60"
    }`;

  return (
    <div className="w-full flex justify-center py-6">
      <div className="w-[90%] 800px:w-[60%] flex items-center justify-between">
        {/* Step 1 */}
        <motion.div
          className={stepClasses(active >= 1)}
          whileHover={active >= 1 ? { scale: 1.1 } : {}}
        >
          <div className={stepNumberClasses(active >= 1)}>1</div>
          <span className={textClasses(active >= 1)}>Shipping</span>
        </motion.div>

        <div className={barClasses(active >= 2)} />

        {/* Step 2 */}
        <motion.div
          className={stepClasses(active >= 2)}
          whileHover={active >= 2 ? { scale: 1.1 } : {}}
        >
          <div className={stepNumberClasses(active >= 2)}>2</div>
          <span className={textClasses(active >= 2)}>Payment</span>
        </motion.div>

        <div className={barClasses(active >= 3)} />

        {/* Step 3 */}
        <motion.div
          className={stepClasses(active >= 3)}
          whileHover={active >= 3 ? { scale: 1.1 } : {}}
        >
          <div className={stepNumberClasses(active >= 3)}>3</div>
          <span className={textClasses(active >= 3)}>Success</span>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutSteps;