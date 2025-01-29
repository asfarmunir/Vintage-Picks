"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import SettingsModal from "@/components/shared/SettingsModal";
import { useRouter } from "next/navigation";
const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const getUserDetails = async () => {
    const response = await fetch("/api/user");
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    const res = await response.json();
    console.log("🚀 ~ getUserDetails ~ res:", res);
    setUser(res.user);
  };

  useEffect(() => {
    getUserDetails();
    setIsModalOpen(true); // Open the modal when the route is reached
  }, []);

  if (!isModalOpen) {
    router.push("/");
  }

  return (
    <div className="flex items-center justify-center">
      <div className=" w-full flex items-center animate-pulse flex-col justify-center gap-3 h-[90svh]">
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
      {user && (
        <SettingsModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          user={user}
        />
      )}
    </div>
  );
};

export default Page;
