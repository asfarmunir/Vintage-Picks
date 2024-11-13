"use client";
import { useGetAccount } from "@/app/hooks/useGetAccount";
import { accountStore } from "@/app/store/account";
import { ALL_STEP_CHALLENGES } from "@/lib/constants";
import { getOriginalAccountValue, getPercentageTimePassed } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Objectives = () => {
  const accountId = accountStore((state) => state.account.id);

  const {
    data: account,
    isPending,
    isError,
    refetch,
  } = useGetAccount(accountId);
  useEffect(() => {
    refetch();
  }, [accountId]);

  // States to store the countdowns
  const [minBetCountdown, setMinBetCountdown] = useState("");
  const [maxBetCountdown, setMaxBetCountdown] = useState("");

  useEffect(() => {
    if (!account) return;

    // Helper function to calculate the time remaining in a readable format
    const calculateCountdown = (endDate: Date) => {
      const now = new Date().getTime();
      const distance = new Date(endDate).getTime() - now;

      if (distance <= 0) return "0D 0H 0M 0S"; // If time has passed

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return `${days}D ${hours}H ${minutes}M ${seconds}S`;
    };

    // Update countdown every second
    const interval = setInterval(() => {
      setMinBetCountdown(calculateCountdown(new Date(account.minBetPeriod)));
      setMaxBetCountdown(calculateCountdown(new Date(account.maxBetPeriod)));
    }, 1000);

    // Clear the interval on component unmount
    return () => clearInterval(interval);
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

  if (!account) {
    return (
      <div className="w-full h-36 flex justify-center items-center bg-[#181926] shadow-inner shadow-gray-700 rounded-lg">
        <p className="text-white">Account not found</p>
      </div>
    );
  }

  return (
    <div className=" w-full space-y-4">
      <div className="w-full flex-col bg-[#181926] shadow-inner p-5 rounded-xl shadow-gray-700 md:flex-row  flex items-center justify-between gap-4">
        <h3 className="text-lg 2xl:text-xl font-bold flex items-center gap-1.5">
          <Image
            src="/icons/stack.png"
            alt="Arrow Icon"
            width={23}
            height={23}
          />
          ${account.accountSize.replace("K", "000")}
          <span className=" text-primary-200">ACCOUNT</span>
        </h3>
        <div className="flex w-full md:w-fit items-center gap-2 flex-col md:flex-row">
          <button className="flex justify-center items-center gap-2 px-4 py-1.5 text-xs w-full md:w-fit 2xl:text-base font-bold bg-[#333547] shadow-inner shadow-gray-600 rounded-lg">
            <Image
              src="/icons/calender.svg"
              alt="Arrow Icon"
              width={20}
              height={20}
            />
            <span className="text-primary-200 uppercase">start date</span>
            {new Date(account.createdAt).toLocaleDateString()}
          </button>
          <button className="flex justify-center text-primary-50 uppercase items-center gap-2 px-4 py-2 text-xs w-full md:w-fit 2xl:text-base font-bold  bg-[#52FC18]/10 rounded-lg">
            <Image
              src="/icons/moon.png"
              alt="Arrow Icon"
              width={18}
              height={18}
            />
            PHASE {account.phase} / {account.accountType === "TWO_STEP" ? 2 : 3}
          </button>
        </div>
      </div>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="w-full flex-col bg-[#181926] shadow-inner p-5 py-6 rounded-xl shadow-gray-700 md:flex-row  flex items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Image
              src="/images/profit.svg"
              alt="Arrow Icon"
              width={43}
              height={43}
            />
            <div className="  font-bold flex flex-col  gap-1">
              <p className=" text-base 2xl:text-lg ">
                $
                {account.balance - getOriginalAccountValue(account) < 0
                  ? 0
                  : (
                    account.balance - getOriginalAccountValue(account)
                  ).toFixed(2)}{" "}
                / $
                {getOriginalAccountValue(account) *
                  ALL_STEP_CHALLENGES.profitTarget}{" "}
              </p>
              <span className=" text-xs 2xl:text-sm text-primary-200">
                PROFIT TARGET
              </span>
            </div>
          </div>
          <div className=" hidden md:flex flex-col items-end gap-2">
            <p className=" text-green-600 font-thin text-sm">
              {(account.balance - getOriginalAccountValue(account) < 0
                ? 0
                : ((account.balance - getOriginalAccountValue(account)) /
                getOriginalAccountValue(account)) * 100).toFixed(2)}{" "}
              %
            </p>
            <div className=" w-36 h-4 bg-[#393C53] rounded-sm border-gray-700">
              <div
                className="h-full bg-[#00B544] rounded-sm shadow-inner shadow-gray-700"
                style={{
                  width: `${(account.balance - getOriginalAccountValue(account) < 0
                      ? 0
                      : ((account.balance - getOriginalAccountValue(account)) /
                        getOriginalAccountValue(account)) * 100) > 100 ? 100 : (
                      (account.balance - getOriginalAccountValue(account)) /
                      getOriginalAccountValue(account) * 100
                    )
                    }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="w-full flex-col bg-[#181926] shadow-inner p-5 py-6 rounded-xl shadow-gray-700 md:flex-row  flex items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Image
              src="/images/loss.svg"
              alt="Arrow Icon"
              width={43}
              height={43}
            />
            <div className="  font-bold flex flex-col  gap-1">
              <p className=" text-base 2xl:text-lg ">
                -${account.dailyLoss || 0} / -$
                {getOriginalAccountValue(account) *
                  ALL_STEP_CHALLENGES.maxDailyLoss}
              </p>
              <span className=" text-xs 2xl:text-sm uppercase text-primary-200">
                Maximum daily loss
              </span>
            </div>
          </div>
          <div className=" hidden md:flex flex-col items-end gap-2">
            <p className=" text-red-600 font-thin text-sm">
              {(
                (account.dailyLoss / getOriginalAccountValue(account)) *
                100
              ).toFixed(2)}
              %
            </p>
            <div className=" w-36 h-4 bg-[#393C53] rounded-sm border-gray-700">
              <div
                className="h-full bg-[#F74418] rounded-sm shadow-inner shadow-gray-700 "
                style={{
                  width: `${(account.dailyLoss / getOriginalAccountValue(account)) *
                      100 >
                      100
                      ? 100
                      : (account.dailyLoss / getOriginalAccountValue(account)) *
                      100
                    }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="w-full flex-col bg-[#181926] shadow-inner p-5 py-6 rounded-xl shadow-gray-700 md:flex-row  flex items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Image
              src="/images/max-loss.svg"
              alt="Arrow Icon"
              width={43}
              height={43}
            />
            <div className="  font-bold flex flex-col  gap-1">
              <p className=" text-base 2xl:text-lg ">
                -${account.totalLoss} / -$
                {getOriginalAccountValue(account) * ALL_STEP_CHALLENGES.maxLoss}
              </p>
              <span className=" text-xs 2xl:text-sm uppercase text-primary-200">
                Maximum loss
              </span>
            </div>
          </div>
          <div className=" hidden md:flex flex-col items-end gap-2">
            <p className=" text-red-600 font-thin text-sm">
              {((account.totalLoss / getOriginalAccountValue(account)) * 100) > 100 ? 100 : (account.totalLoss / getOriginalAccountValue(account)) * 100}
              %
            </p>
            <div className=" w-36 h-4 bg-[#393C53] rounded-sm border-gray-700">
              <div
                className="h-full bg-[#F74418] rounded-sm shadow-inner shadow-gray-700 "
                style={{
                  width: `${((account.totalLoss / getOriginalAccountValue(account)) * 100) > 100 ? 100 : (account.totalLoss / getOriginalAccountValue(account)) * 100
                    }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="w-full flex-col bg-[#181926] shadow-inner p-5 py-6 rounded-xl shadow-gray-700 md:flex-row  flex items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Image
              src="/images/min-picks.svg"
              alt="Arrow Icon"
              width={43}
              height={43}
            />
            <div className="  font-bold flex flex-col  gap-1">
              <p className=" text-base 2xl:text-lg ">
                {account.picks}/{ALL_STEP_CHALLENGES.minPicks}
              </p>
              <span className=" text-xs 2xl:text-sm text-primary-200">
                MINIMUM NUMBER OF PICKS
              </span>
            </div>
          </div>
          <div className=" hidden md:flex flex-col items-end gap-2">
            <p className=" text-green-600 font-thin text-sm">
              {((account.picks / ALL_STEP_CHALLENGES.minPicks) * 100) > 100 ? 100 : (account.picks / ALL_STEP_CHALLENGES.minPicks) * 100}%
            </p>
            <div className=" w-36 h-4 bg-[#393C53] rounded-sm border-gray-700">
              <div
                className="h-full bg-[#00B544] rounded-sm shadow-inner shadow-gray-700 "
                style={{
                  width: `${((account.picks / ALL_STEP_CHALLENGES.minPicks) * 100) > 100 ? 100 : (account.picks / ALL_STEP_CHALLENGES.minPicks) * 100
                    }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="w-full flex-col bg-[#181926] shadow-inner p-5 py-6 rounded-xl shadow-gray-700 md:flex-row  flex items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Image
              src="/images/sports.svg"
              alt="Arrow Icon"
              width={43}
              height={43}
            />
            <div className="  font-bold flex flex-col  gap-1">
              <p className=" text-base 2xl:text-lg ">
                {account.minBetPeriod ? minBetCountdown : `0 Days`} Remaining
              </p>
              <span className=" text-xs 2xl:text-sm text-primary-200">
                MINIMUM BET PERIOD
              </span>
            </div>
          </div>
          <div className=" hidden md:flex flex-col items-end gap-2">
            <p className=" text-green-600 font-thin text-sm">
              {getPercentageTimePassed(
                new Date(account.createdAt),
                new Date(account.minBetPeriod)
              ).toFixed(2)}
              %
            </p>
            <div className=" w-36 h-4 bg-[#393C53] rounded-sm border-gray-700">
              <div
                className="h-full bg-[#00B544] rounded-sm shadow-inner shadow-gray-700 "
                style={{
                  width: `${getPercentageTimePassed(
                    new Date(account.createdAt),
                    new Date(account.minBetPeriod)
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="w-full flex-col bg-[#181926] shadow-inner p-5 py-6 rounded-xl shadow-gray-700 md:flex-row  flex items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Image
              src="/images/time.svg"
              alt="Arrow Icon"
              width={43}
              height={43}
            />
            <div className="  font-bold flex flex-col  gap-1">
              <p className=" text-base 2xl:text-lg ">
                {account.accountType !== "FUNDED" ? maxBetCountdown : `0 Days`}{" "}
                Remaining
              </p>
              <span className=" text-xs 2xl:text-sm text-primary-200">
                TIME REMAINING
              </span>
            </div>
          </div>
          <div className=" hidden md:flex flex-col items-end gap-2">
            <p className=" text-green-600 font-thin text-sm">
              {getPercentageTimePassed(
                new Date(account.createdAt),
                new Date(account.maxBetPeriod)
              ).toFixed(2)}
              %
            </p>
            <div className=" w-36 h-4 bg-[#393C53] rounded-sm border-gray-700">
              <div
                className="h-full bg-[#00B544] rounded-sm shadow-inner shadow-gray-700 "
                style={{
                  width: `${getPercentageTimePassed(
                    new Date(account.createdAt),
                    new Date(account.maxBetPeriod)
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Objectives;
