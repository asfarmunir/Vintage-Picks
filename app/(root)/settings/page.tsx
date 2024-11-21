"use client";
import Navbar from "@/components/shared/Navbar";
import { settingTabs } from "@/lib/constants";
import Image from "next/image";
import React, { Suspense, useEffect } from "react";

import { useGetPreferences } from "@/app/hooks/useGetPreferences";
import BillingSettings from "@/components/shared/BillingSettings";
import GeneralSettings from "@/components/shared/GeneralSettings";
import PreferenceSettings from "@/components/shared/PreferenceSettings";
import Verification from "@/components/shared/Verification";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { MdOutlineArrowUpward } from "react-icons/md";
import { noSSR } from "next/dynamic";
import Agreements from "./agreements";
import { useRouter, useSearchParams } from "next/navigation";

// import KYCVerification from "./kyc-verfication";
const KYCVerification = React.lazy(() => import("./kyc-verfication"));

const page = () => {
  // Router
  const router = useRouter();

  const [tab, setTab] = useState<string>("general");
  const { status, data: session } = useSession();
  const changeTab = (tab: string) => {
    setTab(tab);
  };

  // SEARCH PARAMS
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("tab")) {
      setTab(searchParams.get("tab") as string);
    }
  }, [searchParams]);

  // UPDATE SEARCH PARAMS ON TAB CHANGE
  useEffect(() => {
    if (tab) {
      router.push(`/settings?tab=${tab}`);
    }
  }, [tab]);

  // GET PREFERENCES
  const { mutate: fetchPreferences, data: preferences } = useGetPreferences({
    onSuccess: (data) => {
      // console.log(data);
    },
    onError: (error) => {
      // console.log(error);
    },
  });

  useEffect(() => {
    if (session) {
      fetchPreferences();
    }
  }, [session]);

  return (
    <>
      <div
        className=" hidden md:block sticky 
        top-0
        z-50
        w-full
        "
      >
        <div className=" w-[99%] bg-primary justify-between flex items-center absolute">
          <h1 className=" ml-4  text-white inline-flex items-center gap-2 font-thin 2xl:text-lg">
            <Image
              src="/icons/setting-green.svg"
              alt="Logo"
              width={20}
              height={20}
            />
            SETTINGS
          </h1>
          <Navbar />
        </div>
      </div>
      <div className=" w-full  flex gap-4  text-white mt-1 md:mt-9 p-5 md:p-8 pb-24 max-h-full overflow-auto">
        <div className=" w-full  md:w-[70%] h-full shadow-inner shadow-gray-800 flex flex-col gap-4 bg-[#181926] p-4 md:p-8 mb-8 rounded-xl">
          <div className=" w-full items-center flex justify-between">
            <h2 className=" text-2xl 2xl:text-3xl font-bold text-white">
              {" "}
              SETTINGS
            </h2>
            {/* <button className=" text-white uppercase text-sm bg-[#333547]  px-5 py-2 rounded-lg inline-flex items-center gap-3">
              <Image
                src="/icons/logout.png"
                alt="Edit"
                width={16}
                height={16}
              />
              Sign Out
            </button> */}
          </div>
          {/* T A B S  */}
          <div className="flex mt-4 items-center justify-evenly md:justify-start max-w-full overflow-x-auto pb-4 gap-2 mb-3">
            {settingTabs.map((curr, index) => (
              <button
                key={index}
                className={`border  
             px-5 text-xs 2xl:text-lg py-2 flex-grow md:flex-grow-0 text-nowrap rounded-full ${
               tab === curr.tab
                 ? "border-[#52FC18] bg-[#1A5B0B]"
                 : " border-gray-700 text-[#848BAC] border-2"
             } font-semibold uppercase`}
                onClick={() => changeTab(curr.tab)}
              >
                {curr.name}
              </button>
            ))}
          </div>
          {
            {
              // general: <GeneralSettings />,
              preferences: (
                <PreferenceSettings
                  preferences={preferences}
                  fetchPreferences={fetchPreferences}
                />
              ),
              agreements: <Agreements />,
              billing: <BillingSettings />,
              verification: <Verification />,
              kyc: <KYCVerification />,
            }[tab]
          }
        </div>
        <div className=" hidden md:block md:w-[30%]  ">
          <Image
            src="/images/profile-hero.png"
            alt="Ads"
            width={470}
            priority
            height={450}
            className=" rounded-lg  
             h-full w-full
            
              "
          />
        </div>
      </div>
    </>
  );
};

export default page;
