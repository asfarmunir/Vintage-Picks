"use client";
import Navbar from "@/components/shared/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { useGetAccounts } from "../hooks/useGetAccounts";
import { accountStore } from "../store/account";

const ACCOUNT_STATUS_ICON_DICT = {
  CHALLENGE: "/icons/challenge.svg",
  FUNDED: "/icons/fund.svg",
  BREACHED: "/icons/breach.svg",
};

type accountTypes = "CHALLENGE" | "FUNDED" | "BREACHED";
type sortFilterType = "ALL" | "FUNDED" | "BREACHED" | "CHALLENGE";
const page = () => {
  const [tab, setTab] = React.useState("hide");
  const [sortFilter, setSortFilter] = React.useState<sortFilterType>("ALL");

  const { data, isPending } = useGetAccounts();

  const account = accountStore((state) => state.account);

  // Sort Filter
  const changeSortFilter = (sortFilter: sortFilterType) => {
    setSortFilter(sortFilter);
  };

  // Filter
  const filteredData = useMemo(() => {
    // Tab Filer
    const filteredData = data?.filter((account: any) => {
      if (tab === "show") {
        return (
          account.status === "BREACHED" ||
          account.status === "FUNDED" ||
          account.status === "CHALLENGE"
        );
      } else if (tab === "hide") {
        return account.status !== "BREACHED";
      }
      return true;
    });

    // Sort Filter
    if (sortFilter === "FUNDED") {
      return filteredData?.filter(
        (account: any) => account.status === "FUNDED"
      );
    } else if (sortFilter === "BREACHED") {
      return filteredData?.filter(
        (account: any) => account.status === "BREACHED"
      );
    } else if (sortFilter === "CHALLENGE") {
      return filteredData?.filter(
        (account: any) => account.status === "CHALLENGE"
      );
    } else {
      return filteredData;
    }
  }, [tab, data, sortFilter]);

  return (
    <>
      {/* <div
        className="hidden md:block sticky 
        top-0
        z-50
        w-full
        "
      >
        <div className=" w-[99%] bg-primary justify-between flex items-center absolute">
          <h1 className=" ml-4  text-white inline-flex items-center gap-2 font-thin 2xl:text-lg">
            <Image src="/icons/home.svg" alt="Logo" width={20} height={20} />
            Home
          </h1>
          <Navbar />
        </div>
      </div> */}
      <div className=" pt-6 relative px-5 2xl:px-8 2xl:mt-4 pb-24 text-white  max-h-full overflow-auto space-y-4  ">
        <div className="p-8  pb-48 md:pb-12 overflow-hidden relative min-h-48 2xl:min-h-56 rounded-2xl w-full bg-primary-100 flex flex-col gap-3 ">
          <div className="inline-flex flex-col sm:flex-row items-center gap-2">
            <h1 className="text-3xl 2xl:text-4xl font-bold">
              BET SPORTS WITH OUR
            </h1>
            <Image
              src="/images/money.png"
              alt="Football Icon"
              width={110}
              className=" -mt-9 mr-12 sm:mr-0 sm:mt-0 2xl:w-[130px] 2xl:ml-1"
              height={110}
            />
          </div>
          <p className=" text-[#AFB2CA] mb-3 mt-4 md:mt-0 2xl:text-lg font-semibold">
            Lower risk, higher rewards, bet with our capital
          </p>
          <Dialog>
            <DialogTrigger className=" w-fit text-sm 2xl:text-base rounded-xl inner-shadow px-4 py-3 inline-flex items-center gap-3">
              <Image
                src="/icons/video.svg"
                alt="Arrow Icon"
                width={15}
                height={15}
              />
              <span className=" font-bold uppercase">How it works</span>{" "}
            </DialogTrigger>
            <DialogContent className=" bg-primary-100 gap-1 py-12 text-white border-none md:min-w-[700px] 2xl:min-w-[900px] flex flex-col items-center">
              <h2 className=" text-3xl font-bold">HOW IT WORKS</h2>
              <DialogDescription>
                You can find more information on our help tab
              </DialogDescription>
            </DialogContent>
          </Dialog>
          <Image
            src="/images/hero.png"
            alt="Hero Image"
            width={700}
            height={700}
            className=" absolute bottom-0 right-0  md:-right-20 md:-bottom-28 2xl:w-[840px] 2xl:-bottom-36"
          />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className=" p-3 pb-8 md:p-8 md:pb-8 overflow-hidden relative min-h-32 2xl:min-h-44 rounded-2xl w-full bg-primary-100 flex flex-col gap-1 ">
            <div className=" w-full flex items-center justify-between">
              <p className=" text-[#AFB2CA] mb-3 mt-4 md:mt-0 2xl:text-lg font-semibold">
                TOTAL FUNDED AMOUNT
              </p>
              <Link href={"/user/profile?tab=accounts&status=funded"}>
                <Image
                  src="/icons/arrow.svg"
                  alt="Arrow Icon"
                  width={30}
                  className=" border-2 border-gray-600 rounded-lg bg-[#272837] p-0.5"
                  height={30}
                />
              </Link>
            </div>
            <div className=" flex items-center gap-4">
              <Image
                src="/icons/funded.svg"
                alt="Arrow Icon"
                width={45}
                height={45}
              />
              <p className="   md:mt-0  text-4xl font-bold">
                $
                {(account.status === "FUNDED"
                  ? account.totalFundedAmount
                  : 0
                )?.toFixed(2)}
              </p>
            </div>
          </div>
          <div className=" p-3 pb-8 md:p-8 md:pb-8 overflow-hidden relative min-h-32 2xl:min-h-44 rounded-2xl w-full bg-primary-100 flex flex-col gap-1 ">
            <div className=" w-full flex items-center justify-between">
              <p className=" text-[#AFB2CA] uppercase mb-3 mt-4 md:mt-0 2xl:text-lg font-semibold">
                Total Payout Amount
              </p>
              <Link href={"/user/profile?tab=payouts"}>
                <Image
                  src="/icons/arrow.svg"
                  alt="Arrow Icon"
                  width={30}
                  className=" border-2 border-gray-600 rounded-lg bg-[#272837] p-0.5"
                  height={30}
                />
              </Link>
            </div>
            <div className=" flex items-center gap-4">
              <Image
                src="/icons/payout.svg"
                alt="Arrow Icon"
                width={45}
                height={45}
              />
              <p className="   md:mt-0  text-4xl font-bold">
                ${account.totalFundedPayout?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        {account.id !== "" && (
          <div className=" w-full space-y-5 bg-primary-100 py-6 px-2 md:p-8 rounded-2xl 2xl:p-6">
            <div className=" w-full flex flex-col gap-3 md:flex-row items-center  justify-between">
              <h2 className=" text-xl font-bold">ACCOUNTS OVERVIEW</h2>
              <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-fit">
                {tab !== "show" ? (
                  <button
                    onClick={() => setTab("show")}
                    className=" bg-[#272837]   justify-center  w-full md:w-fit text-sm px-3.5 py-2 rounded-xl inline-flex items-center gap-2"
                  >
                    <Image
                      src="/icons/check.png"
                      alt="Arrow Icon"
                      width={18}
                      height={18}
                    />
                    SHOW BREACHED
                  </button>
                ) : (
                  <button
                    onClick={() => setTab("hide")}
                    className=" bg-[#272837]   justify-center  w-full md:w-fit text-sm px-3.5 py-2 rounded-xl inline-flex items-center gap-2"
                  >
                    <Image
                      src="/icons/hide.png"
                      alt="Arrow Icon"
                      width={18}
                      height={18}
                    />
                    HIDE INACTIVE
                  </button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger className=" bg-[#272837]    justify-center w-full md:w-fit  text-sm px-3.5 py-2 rounded-xl inline-flex items-center gap-2">
                    <Image
                      src="/icons/sort.png"
                      alt="Arrow Icon"
                      width={18}
                      height={18}
                    />
                    SORT
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48  bg-[#181926] text-white border-none  mt-1  p-3 rounded-lg shadow-sm">
                    <DropdownMenuItem
                      className="flex items-center justify-between "
                      onClick={() => changeSortFilter("ALL")}
                    >
                      <p>All</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between "
                      onClick={() => changeSortFilter("CHALLENGE")}
                    >
                      <p>CHALLENGE</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between "
                      onClick={() => changeSortFilter("FUNDED")}
                    >
                      <p>FUNDED</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between "
                      onClick={() => changeSortFilter("BREACHED")}
                    >
                      <p>BREACHED</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link
                  href={"/create-account"}
                  className="  shadow-green-400 font-bold   justify-center w-full md:w-fit inner-shadow text-sm px-3.5 py-2 rounded-xl inline-flex items-center gap-2"
                >
                  <Image
                    src="/icons/add.png"
                    alt="Arrow Icon"
                    width={18}
                    height={18}
                  />
                  ADD ACCOUNT
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isPending && data?.length === 0 ? (
                <div className=" bg-[#272837] p-3 pb-8 md:p-7  overflow-hidden relative  rounded-2xl w-full  flex flex-col gap-1 ">
                  <p className=" text-white mb-3 mt-4 md:mt-0 2xl:text-lg font-semibold">
                    No accounts found
                  </p>
                </div>
              ) : null}
              {isPending ? (
                <>Loading...</>
              ) : filteredData.length === 0 ? (
                <>
                  <div className=" bg-[#272837] p-3 pb-8 md:p-7  overflow-hidden relative  rounded-2xl w-full  flex flex-col gap-1 ">
                    <p className=" text-white mb-3 mt-4 md:mt-0 2xl:text-lg font-semibold">
                      No {sortFilter.toLowerCase()} accounts found. Make sure
                      you have set filters properly.
                    </p>
                  </div>
                </>
              ) : (
                filteredData?.map((account: any, index: number) => (
                  <Link
                    key={index}
                    className=" bg-[#272837] p-3 pb-8 md:p-7  overflow-hidden relative  rounded-2xl w-full  flex flex-col gap-1 border border-transparent hover:border-primary-50/70"
                    href={`/dashboard?account=${account.id}`}
                  >
                    <div className=" w-full flex items-center justify-between">
                      <p className=" text-white mb-3 mt-4 md:mt-0 2xl:text-lg font-semibold">
                        ${account.accountSize.replace("K", "000")}
                      </p>
                      <Image
                        src={`${
                          ACCOUNT_STATUS_ICON_DICT[
                            account.status as accountTypes
                          ]
                        }`}
                        alt="Arrow Icon"
                        width={100}
                        height={100}
                      />
                    </div>
                    <div className=" w-full flex items-center justify-between">
                      <p className=" text-xs md:text-sm text-[#AFB2CA]  mb-3 mt-4 md:mt-1 2xl:text-lg ">
                        ACCOUNT BALANCE
                      </p>
                      <p className=" text-white mb-3 mt-4 text-xs  md:mt-0 2xl:text-lg font-semibold">
                        ${account.balance}
                      </p>
                    </div>
                    <div className=" w-full flex items-center justify-between">
                      <p className=" text-[#AFB2CA] text-xs md:text-sm mb-3 mt-4 md:mt-1 2xl:text-lg ">
                        ACCOUNT NUMBER
                      </p>
                      <p className=" text-white mb-3 mt-4 text-xs md:text-sm md:mt-0 2xl:text-lg font-semibold">
                        #{account.accountNumber}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
        <div className=" w-full h-ull bg-primary-100 py-6 px-2 md:p-8 flex flex-col gap-2 items-center justify-center min-h-48 rounded-2xl 2xl:p-6">
          <Image
            src="/images/account.png"
            alt="Hero Image"
            width={70}
            height={70}
            className=" mb-4"
          />
          <h2 className=" text-xl font-bold text-wrap uppercase">
            Create a new account
          </h2>
          <p className=" text-gray-400 mb-4 leading-snug text-center">
            Purchase a new account and start earning <br /> money now!
          </p>
          <Link
            href={"/create-account"}
            className=" inline-flex items-center py-2 px-4 rounded-lg inner-shadow"
          >
            <Image
              src="/icons/add.png"
              alt="Arrow Icon"
              width={20}
              height={20}
            />
            <span className="ml-2">Add Account</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default page;
