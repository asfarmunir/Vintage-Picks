import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react";
import { LuChevronsUpDown } from "react-icons/lu";

import { useGetAccounts } from "@/app/hooks/useGetAccounts";
import { accountStore } from "@/app/store/account";
import { Account } from "@prisma/client";
import { ChevronsUpDownIcon, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const UserAccount = ({
  setUserHasAccounts,
}: {
  setUserHasAccounts?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const { data: userAccounts, isPending, isError } = useGetAccounts();

  const challengeColorClasses = {
    CHALLENGE: "text-[#C02FF5]/70 border-[#C02FF5]/80 bg-[#C02FF5]/10",
    FUNDED: "text-[#53FC18]/70 border-[#53FC18]/80 bg-[#53FC18]/10",
    BREACHED: "text-[#F74418]/70 border-[#F74418]/80 bg-[#F74418]/10",
  };

  // Active Account
  const activeAccount = accountStore((state) => state.account);

  // Update Account
  const setActiveAccount = accountStore((state) => state.setAccount);

  // Change User Account
  const changeUserAccount = (account: Account) => {
    setActiveAccount(account);
    localStorage.setItem("account", account.id);
    router.push("/dashboard");
  };

  // Search Params
  const searchParams = useSearchParams();
  const account = searchParams.get("account");

  useEffect(() => {
    if (account && userAccounts) {
      const newActiveAccount = userAccounts.find(
        (userAccount: Account) => userAccount.id === account
      );
      changeUserAccount(newActiveAccount);
    }
  }, [account, userAccounts]);

  useEffect(() => {
    if (!setUserHasAccounts) return;
    if (userAccounts && userAccounts.length > 0) {
      setUserHasAccounts(true);
    } else {
      setUserHasAccounts(false);
    }
  }, [userAccounts]);

  return (
    <div className=" w-full md:w-fit py-4  md:p-4">
      <DropdownMenu>
        <DropdownMenuTrigger className=" data-[state=open]:border-2  data-[state=open]:shadow data-[state=open]:shadow-primary-50/30 data-[state=open]:border-primary-50/50   bg-[#272837]  font-bold   justify-center text-nowrap w-full md:w-fit  text-xs md:text-sm px-1.5 md:px-4 py-2  rounded-lg inline-flex items-center gap-2">
          {(!isPending && userAccounts.length === 0) || isError ? (
            <span className="uppercase text-gray-400 flex gap-2 items-center text-xs 2xl:text-base pr-1.5">
              No Account <ChevronsUpDownIcon className="w-4 h-4" />
            </span>
          ) : (
            <>
              <span className=" text-white text-xs 2xl:text-base border-r border-gray-600 pr-1.5 md:pr-4">
                ${activeAccount.balance}
              </span>
              <span className=" text-[#848BAC] px-1 md:px-2 text-xs 2xl:text-base">
                ACCOUNT
              </span>
              <span className=" text-white text-xs 2xl:text-base border-r border-gray-600 pr-1.5 md:pr-4">
                {`#${activeAccount.accountNumber}`}
              </span>
              <span
                className={`border inline-flex items-center gap-x-1 md:gap-x-1.5 text-xs 2xl:text-base  p-1 px-1 md:px-2 rounded-sm
            ${challengeColorClasses[activeAccount.status]}
            `}
              >
                <Image
                  src={`/icons/account-${activeAccount.status.toLowerCase()}.svg`}
                  alt="Arrow Icon"
                  width={13}
                  height={13}
                />
                {activeAccount.status.toUpperCase()}
              </span>
              <LuChevronsUpDown className=" md:text-lg text-white" />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="   border-none shadow-gray-600   bg-[#181926] text-white   mt-1  p-1 rounded-lg shadow-base">
          {!isPending &&
            userAccounts.map((account: Account, index: number) => (
              <DropdownMenuItem
                key={index}
                className="flex py-0 items-center gap-14 md:gap-28 justify-between"
                onClick={() => changeUserAccount(account)}
              >
                <p className="  inline-flex items-center font-bold">
                  ${account.balance}{" "}
                  <span className="text-3xl flex  mb-4 mx-1.5">.</span>
                  {account.accountNumber}
                </p>
                <span
                  className={` border font-semibold inline-flex items-center gap-x-1.5 text-xs 2xl:text-base  p-1 px-2  rounded-sm ${
                    challengeColorClasses[account.status]
                  }`}
                >
                  <Image
                    src={`/icons/account-${account.status.toLowerCase()}.svg`}
                    alt="Arrow Icon"
                    width={13}
                    height={13}
                  />
                  {account.status.toUpperCase()}
                </span>
              </DropdownMenuItem>
            ))}
          {!isPending && userAccounts.length === 0 && (
            <DropdownMenuItem className="flex py-0 items-center gap-14 md:gap-28 justify-between ">
              <p className="  inline-flex items-center font-bold">
                No Accounts Found
              </p>
            </DropdownMenuItem>
          )}
          {isPending && (
            <DropdownMenuItem className="flex py-0 items-center gap-14 md:gap-28 justify-between ">
              <p className="  inline-flex items-center font-bold">
                <LoaderCircle className="animate-spin" />
                Loading Accounts
              </p>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {(!isPending && userAccounts.length === 0) && (
        <Link
          href={"/create-account"}
          className="ml-4 uppercase font-bold text-white w-fit text-sm rounded-xl inner-shadow px-6 py-2.5 inline-flex items-center gap-3 hover:opacity-95"
        >
          Add Account
        </Link>
      )}
    </div>
  );
};

export default UserAccount;
