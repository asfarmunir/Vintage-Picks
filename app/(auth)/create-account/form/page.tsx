"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import CheckoutPayment from "@/components/shared/CheckoutPayment";

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsModalOpen(true); // Open the modal when the route is reached
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className=" w-full flex items-center animate-pulse flex-col justify-center gap-3 h-screen">
        <Image
          src={"/vintage/images/logo.svg"}
          alt="logo"
          width={150}
          height={150}
          priority
        />
        <p className=" text-[1.1rem]  text-vintage-50 font-semibold ">
          Lets Place Some Trades{" "}
        </p>
      </div>
      <CheckoutPayment isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </div>
  );
};

export default Page;
