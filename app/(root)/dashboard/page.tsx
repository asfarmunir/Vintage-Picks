"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
// import { MdOutlineArrowUpward } from "react-icons/md";
import { useGetAccountStats } from "@/app/hooks/useGetAccountStats";
import { accountStore } from "@/app/store/account";
import AccountGraph from "@/components/shared/AccountGraph";
import BetHistory from "@/components/shared/BetHistory";
import Navbar from "@/components/shared/Navbar";
import Objectives from "@/components/shared/Objectives";
import UserAccount from "@/components/shared/UserAccount";
import { dashboardTabs } from "@/lib/constants";
import { getOriginalAccountValue } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import PayoutsExplained from "./payouts-explained";
const page = () => {
  // ACCOUNT
  const account = accountStore((state) => state.account);

  // TABS
  const [tab, setTab] = React.useState("stats");
  const changeTab = (tab: string) => {
    setTab(tab);
  };

  // Payout Explained Modal
  const [open, setOpen] = useState(false);
  const openExplanation = () => {
    setOpen(true);
  };

  // Graph Filter
  const [filter, setFilter] = useState<"1M" | "7D" | "3M" | "24H">("1M");
  const changeFilter = (filter: "1M" | "7D" | "3M" | "24H") => {
    setFilter(filter);
  };

  return (
    <>
      <PayoutsExplained open={open} setOpen={setOpen} />
      <div
        className=" hidden md:block sticky 
        top-0
        z-50
        w-full
        "
      >
        <div className=" w-[99%] bg-primary justify-between flex items-center absolute">
          {/* <h1 className=" ml-4  text-white inline-flex items-center gap-2 font-thin 2xl:text-lg">
            <Image src="/icons/help.png" alt="Logo" width={20} height={20} />
            HELP
          </h1> */}
          <UserAccount />
          <Navbar />
        </div>
      </div>

      <div className=" pt-6 md:pt-20 relative px-3 md:px-5 2xl:px-8 2xl:mt-4 pb-24 text-white  max-h-full overflow-auto space-y-6 ">
        <div className=" w-full flex md:hidden items-center justify-between">
          <UserAccount />
        </div>

        <div className="w-full flex-col md:flex-row  flex items-center justify-between gap-4">
          <div className="flex flex-col  items-start justify-start  w-full md:w-fit  ">
            <h3 className="text-lg 2xl:text-2xl font-bold">
              Account Dashboard
            </h3>
            <p className=" text-sm 2xl:text-base text-[#848BAC]">
              Track performance and review your data.
            </p>
          </div>
          <div className="flex w-full md:w-fit items-center gap-2 flex-col md:flex-row">
            <button
              className="flex justify-center items-center gap-2 px-4 py-2 text-sm w-full md:w-fit 2xl:text-base font-bold bg-[#333547] shadow-inner shadow-gray-600 rounded-lg"
              onClick={openExplanation}
            >
              <Image
                src="/icons/help-white.svg"
                alt="Arrow Icon"
                width={20}
                height={20}
              />
              PAYOUTS EXPLAINED
            </button>
            <Link
              href={"/user/profile?tab=payouts"}
              className="flex justify-center uppercase items-center gap-2 px-4 py-2 text-sm w-full md:w-fit 2xl:text-base font-bold bg-[#333547] inner-shadow rounded-lg"
            >
              <Image
                src="/icons/stack.png"
                alt="Arrow Icon"
                width={18}
                height={18}
              />
              Request Payout
            </Link>
          </div>
        </div>
        <div className=" w-full bg-[#181926] rounded-lg shadow-inner shadow-gray-800">
          <div className=" w-full flex flex-col md:flex-row gap-5  items-start justify-between  p-5">
            <div className="flex flex-col gap-1">
              <p className=" font-bold  text-primary-200">ACCOUNT BALANCE</p>
              <h2 className=" text-3xl 2xl:text-4xl font-bold text-white">
                ${account.balance.toLocaleString()}
              </h2>
              <div className="flex items-center my-3 gap-3 md:gap-10">
                <div className="flex flex-col ">
                  <p className="   text-xs 2xl:text-sm text-primary-200">
                    PROFIT
                  </p>
                  <h2 className="  2xl:text-lg font-semibold text-white">
                    $
                    {account.balance - getOriginalAccountValue(account) < 0
                      ? "0"
                      : (account.balance - getOriginalAccountValue(account)).toFixed(2)}
                  </h2>
                </div>{" "}
                <div className="flex flex-col ">
                  <p className="   text-xs 2xl:text-sm text-primary-200">
                    RETURN
                  </p>
                  <h2 className="  2xl:text-lg text-green-600 font-semibold  inline-flex items-center ">
                    <Image
                      src="/icons/retrun.svg"
                      alt="Arrow Icon"
                      width={23}
                      height={23}
                    />
                    {account.balance - getOriginalAccountValue(account) < 0
                      ? 0
                      : (
                          (Math.abs(
                            account.balance - getOriginalAccountValue(account)
                          ) /
                            getOriginalAccountValue(account)) *
                          100
                        ).toFixed(2)}
                    %
                  </h2>
                </div>{" "}
              </div>
            </div>{" "}
            <div className="flex w-full md:w-fit justify-center items-center bg-primary uppercase text-xs 2xl:text-sm rounded-md text-white px-2 py-0.5">
              <span
                className={`px-2 flex-grow text-center  py-0.5 font-bold text-primary-200 rounded ${
                  filter === "24H" && "bg-primary-200/60 text-white"
                }`}
                role="button"
                onClick={() => changeFilter("24H")}
              >
                24 h
              </span>
              <span
                className={`px-2 flex-grow text-center  py-0.5 font-bold text-primary-200 rounded ${
                  filter === "7D" && "bg-primary-200/60 text-white"
                }`}
                onClick={() => changeFilter("7D")}
                role="button"
              >
                7d
              </span>
              <span
                className={`px-2 flex-grow text-center  py-0.5 font-bold text-primary-200 rounded ${
                  filter === "1M" && "bg-primary-200/60 text-white"
                }`}
                onClick={() => changeFilter("1M")}
                role="button"
              >
                1 m
              </span>
              <span
                className={`px-2 flex-grow text-center  py-0.5 font-bold text-primary-200 rounded ${
                  filter === "3M" && "bg-primary-200/60 text-white"
                }`}
                onClick={() => changeFilter("3M")}
                role="button"
              >
                3 m
              </span>
            </div>
          </div>
          <div className="p-1 md:p4">
            <AccountGraph filter={filter} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex mt-4 items-center justify-evenly md:justify-start flex-wrap gap-2 mb-3">
            {dashboardTabs.map((curr, index) => (
              <button
                key={index}
                className={`border  
             px-4 text-xs 2xl:text-lg py-2 flex w-full md:w-fit justify-center  items-center flex-grow md:flex-grow-0 rounded-full ${
               tab === curr.tab
                 ? "border-[#52FC18] bg-[#1A5B0B]"
                 : " border-gray-700 text-[#848BAC] border-2"
             } font-semibold uppercase`}
                onClick={() => changeTab(curr.tab)}
              >
                <Image
                  src={tab === curr.tab ? curr.icon[0] : curr.icon[1]}
                  alt="Icon"
                  width={18}
                  height={18}
                  className="mr-2"
                />
                {curr.title}
              </button>
            ))}
          </div>
          <Link
            href={"/picks"}
            className="hidden md:flex justify-center uppercase items-center gap-2 px-4 py-2 text-sm w-full md:w-fit 2xl:text-base font-bold bg-[#333547] inner-shadow rounded-lg"
          >
            <Image
              src="/icons/pick.png"
              alt="Arrow Icon"
              width={18}
              height={18}
            />
            PLACE PICK
          </Link>
        </div>

        {/* <stats /> */}
        {/* <BetHistory /> */}
        {/* <Objectives /> */}

        {
          {
            stats: <Stats />,
            history: <BetHistory />,
            objectives: <Objectives />,
          }[tab]
        }
      </div>
    </>
  );
};

export default page;

const Stats = () => {
  const account = accountStore((state) => state.account);
  const {
    data: accountStats,
    isPending,
    isError,
    refetch,
  } = useGetAccountStats({ accountId: account.id });

  useEffect(() => {
    refetch();
  }, [account]);

  if (isError) {
    toast.error("Error fetching account stats");
    return (
      <div className="w-full h-36 flex justify-center items-center bg-[#181926] shadow-inner shadow-gray-700 rounded-lg">
        <p className="text-white">Error fetching account stats</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="w-full h-36 flex justify-center items-center bg-[#181926] shadow-inner shadow-gray-700 rounded-lg">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  return (
    <div className=" w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 ">
      {accountStats.map((stat: any, index: number) => (
        <div
          key={index}
          className=" bg-[#181926] shadow-inner shadow-gray-700 font-bold rounded-lg text-white p-5 flex flex-col gap-2"
        >
          <p className="uppercase text-[#848BAC] text-xs 2xl:text-sm font-bold">
            {stat.title}
          </p>
          <h2 className="text-2xl 2xl:text-3xl ">{stat.value}</h2>
        </div>
      ))}
    </div>
  );
};
