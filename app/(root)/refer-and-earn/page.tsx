"use client";
import Navbar from "@/components/shared/Navbar";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "next-auth/react";
import { TiArrowLeft, TiArrowRight } from "react-icons/ti";
import {
  LEVEL_1_TARGET,
  LEVEL_2_TARGET,
  REFER_COMMISSIONS,
} from "@/lib/constants";
import { useGetUser } from "@/app/hooks/useGetUser";
import { useGetReferHistory } from "@/app/hooks/useGetReferHistory";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import PayoutModal from "./payout-modal";
import { Loader2 } from "lucide-react";

const page = () => {
  const [toggle, setToggle] = useState(false);
  const [copySuccess, setCopySuccess] = useState(""); // To show copy success message
  const currentUser: any = useSession().data?.user;

  const truncateString = (str: string, num: number) => {
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + "...";
  };

  let link = `${process.env.NODE_ENV === "production" ? "https://app.pickshero.io":"http://localhost:3000" }/signup?referrerCode=${currentUser.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link).then(
      () => {
        setCopySuccess("Link copied!");
        setTimeout(() => setCopySuccess(""), 2000);
      },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  };

  const { data: referHistory, isPending: referHistoryPending } =
    useGetReferHistory();
  const { data: user, isPending } = useGetUser();

  const getUserCommision = (totalReferrals: number) => {
    // Determine referral level
    let referralLevel: "level1" | "level2" | "level3" = "level1";
    if (totalReferrals < LEVEL_1_TARGET) {
      referralLevel = "level1";
    } else if (totalReferrals < LEVEL_2_TARGET) {
      referralLevel = "level2";
    } else {
      referralLevel = "level3";
    }

    const levelInformation = REFER_COMMISSIONS[referralLevel];
    return levelInformation.commission;
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    // format in the form "May 29, 23:26"
    return dateObj.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Payout Modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const openPayoutModal = () => setPayoutModalOpen(true);
  const closePayoutModal = () => setPayoutModalOpen(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5; // Adjust as needed

  const totalPages = useMemo(
    () => Math.ceil(referHistory?.length / rowsPerPage),
    [referHistory?.length, rowsPerPage]
  );

  const currentHistoryPage = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return referHistory?.slice(start, end);
  }, [referHistory, currentPage, rowsPerPage]);

  // Change page
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <>
      <div className="hidden md:block sticky top-0 z-50 w-full">
        <div className="w-[99%] bg-primary justify-between flex items-center absolute">
          <h1 className="ml-4 uppercase text-white inline-flex items-center gap-2 font-semibold 2xl:text-lg">
            <Image src="/icons/refer.svg" alt="Logo" width={20} height={20} />
            refer & earn
          </h1>
          <Navbar />
        </div>
      </div>
      <PayoutModal open={payoutModalOpen} onClose={closePayoutModal} />
      <div className="w-full flex text-white gap-4 mt-1 md:mt-9 p-5 md:p-8 pb-24 max-h-full overflow-auto">
        <div className="w-full md:w-[70%] h-full shadow-inner shadow-gray-800 flex flex-col gap-7 bg-[#181926] p-4 md:p-6 rounded-xl">
          <div className="w-full items-center flex justify-between">
            <h2 className="text-2xl 2xl:text-3xl font-bold uppercase text-white">
              refer & earn
            </h2>
            {/* <button className="hover:outline hover:outline-1 hover:outline-primary-200 text-white font-semibold uppercase text-sm bg-[#333547] px-4 py-2 rounded-lg inline-flex items-center gap-2">
              <Image src="/icons/info.png" alt="Edit" width={17} height={17} />
              Learn more
            </button> */}
          </div>
          <div className="border-2 border-[#52FC18]/40 bg-[#52FC18]/15 p-3 md:p-7 rounded-2xl w-full flex flex-col md:flex-row gap-3 items-center justify-between">
            <h2 className="font-bold text-lg text-[#848BAC]">
              Code:
              <span className="text-primary-50 ml-1">
                {
                  `${truncateString(link, 30)}`
                }
              </span>
            </h2>
            <button
              onClick={handleCopyLink}
              className="text-white inner-shadow font-semibold hover:outline hover:outline-1 hover:outline-primary-200 uppercase text-xs md:text-base 2xl:text-lg bg-[#333547] px-5 py-3 rounded-xl inline-flex items-center gap-3"
            >
              <Image src="/icons/copy.png" alt="Edit" width={18} height={18} />
              COPY LINK
            </button>
            {/* Display copy success message */}
            {copySuccess && <p className="text-green-500">{copySuccess}</p>}
          </div>
          <div className="bg-[#272837] p-3 md:p-7 rounded-2xl w-full flex flex-col md:flex-row items-center justify-between gap-3">
            <h2 className="font-bold text-[#848BAC] lg:text-2xl flex">
              Your commission:{" "}
              <span className="text-white ml-1">
                {isPending
                  ? (<Loader2 className="animate-spin" />)
                  : `${getUserCommision(user.user.totalReferrals || 0) * 100}%`}
              </span>
            </h2>
            <Sheet>
              <SheetTrigger className="text-white font-semibold hover:outline hover:outline-1 hover:outline-primary-200 uppercase text-xs md:text-base 2xl:text-lg bg-[#333547] px-5 py-3 rounded-lg shadow-inner shadow-gray-500 inline-flex items-center gap-3">
                <Image
                  src="/icons/trophy.png"
                  alt="Edit"
                  width={18}
                  height={18}
                />
                VIEW MILESTONES
              </SheetTrigger>
              <SheetContent className="bg-primary text-white border-none">
                <div className="bg-[#181926] h-full flex flex-col p-4 gap-2 overflow-auto max-h-full">
                  <h2 className="text-3xl font-bold mb-5">MILESTONES</h2>
                  <div className="flex flex-col items-center p-3 py-7 rounded-2xl shadow-inner shadow-gray-700 gap-3 bg-[#050614]">
                    <Image
                      src="/images/p1.png"
                      alt="Edit"
                      width={60}
                      className="mb-2"
                      height={60}
                    />
                    <h2 className="text-xl font-bold">
                      {" "}
                      <span className="text-primary-50 mr-1">10</span> REFERRALS
                    </h2>
                    <p className="text-sm font-thin text-center">
                      Get a $50 bonus on top of your commissions
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-3 py-7 rounded-2xl shadow-inner shadow-gray-700 gap-3 bg-[#050614]">
                    <Image
                      src="/images/p2.png"
                      alt="Edit"
                      width={70}
                      className="mb-2"
                      height={70}
                    />
                    <h2 className="text-xl font-bold">
                      {" "}
                      <span className="text-primary-50 mr-1">50</span> REFERRALS
                    </h2>
                    <p className="text-sm font-thin text-center">
                      UPGRADE FROM 15% TO 20% <br /> COMMISSONS
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-3 py-7 rounded-2xl shadow-inner shadow-gray-700 gap-3 bg-[#050614]">
                    <Image
                      src="/images/p3.png"
                      alt="Edit"
                      width={70}
                      className="mb-2"
                      height={70}
                    />
                    <h2 className="text-xl font-bold">
                      {" "}
                      <span className="text-primary-50 mr-1">100</span>{" "}
                      REFERRALS
                    </h2>
                    <p className="text-sm font-thin text-center px-4">
                      BECOME AN OFFICIAL PICKSHERO PARTNER. GET OPTIONS TO MAKE
                      EVEN MORE MONEY.
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="bg-primary p-1.5 w-full flex items-center rounded-lg">
            <button
              onClick={() => setToggle(false)}
              className={`${
                !toggle ? "bg-[#393C53] " : "bg-transparent text-[#848BAC]"
              } h-full w-full font-bold text-center rounded-lg uppercase py-2`}
            >
              TOTAL AVAILABLE
            </button>
            <button
              onClick={() => setToggle(true)}
              className={`${
                toggle ? "bg-[#393C53] " : "bg-transparent text-[#848BAC]"
              } h-full w-full font-bold text-center rounded-lg uppercase py-2`}
            >
              {" "}
              TOTAL PAYOUT
            </button>
          </div>
          <div className="w-full space-y-5 bg-primary-100 rounded-2xl mb-8">
            <div className="bg-[#272837] p-3 pb-8 md:p-7 rounded-2xl w-full flex items-start justify-between gap-1">
              <div className="flex flex-col gap-1">
                <p className="text-[#AFB2CA] mb-3 mt-4 md:mt-0 2xl:text-lg font-semibold">
                  Total {toggle ? "Payout" : "Earned"}
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    src="/icons/funded.svg"
                    alt="Arrow Icon"
                    width={45}
                    height={45}
                  />
                  <p className="md:mt-0 text-3xl 2xl:text-5xl font-semibold">
                    $
                    {isPending
                      ? "Loading..."
                      : toggle
                      ? user.user.totalReferPayout.toFixed(2) || 0
                      : user.user.totalEarned.toFixed(2) || 0}
                  </p>
                </div>
              </div>
              {toggle && (
                <button
                  className="text-white inner-shadow font-semibold hover:border hover:border-primary-200 uppercase text-[10px] text-nowrap md:text-base 2xl:text-lg bg-[#333547] px-5 py-3 rounded-xl inline-flex items-center gap-3"
                  onClick={openPayoutModal}
                >
                  <Image
                    src="/icons/stack.png"
                    alt="Edit"
                    width={20}
                    className="hidden md:block"
                    height={20}
                  />
                  REQUEST PAYOUT
                </button>
              )}
            </div>
            <div className="w-full border border-gray-700 rounded-xl flex flex-col">
              <div className="flex items-center justify-between w-full p-6">
                <h3 className="text-lg font-bold">REFERAL HISTORY</h3>
              </div>
              <Table>
                <TableHeader className="bg-[#333547] text-[#848BAC] border-none">
                  <TableRow className="border-none">
                    <TableHead className="uppercase font-bold text-center">
                      Date
                    </TableHead>
                    <TableHead className="uppercase font-bold text-center">
                      ORDER VALUE
                    </TableHead>
                    <TableHead className="uppercase font-bold text-center">
                      ORDER NUMBER
                    </TableHead>
                    <TableHead className="uppercase font-bold text-center">
                      COMMISSION
                    </TableHead>
                    <TableHead className="uppercase font-bold text-center">
                      STATUS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referHistoryPending ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : referHistory.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 uppercase"
                      >
                        No referal history
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentHistoryPage.map((refer: any) => (
                      <TableRow className="border-none">
                        <TableCell className="font-semibold max-w-[100px] capitalize text-xs 2xl:text-base text-center truncate">
                          {formatDate(refer.createdAt)}
                        </TableCell>
                        <TableCell className="font-semibold max-w-[100px] capitalize text-xs 2xl:text-base text-center truncate">
                          ${refer.orderValue}
                        </TableCell>
                        <TableCell className="font-semibold max-w-[100px] capitalize text-xs 2xl:text-base text-center truncate">
                          #{refer.orderNumber}
                        </TableCell>
                        <TableCell className="font-semibold max-w-[100px] capitalize text-xs 2xl:text-base text-center truncate">
                          ${refer.commission}
                        </TableCell>
                        <TableCell className="font-semibold max-w-[140px] capitalize text-xs 2xl:text-base flex items-center justify-center truncate">
                          {refer.status === "paid" ? (
                            <p className="px-2 py-1 bg-green-500/20 text-green-500 border border-green-500 rounded-full">
                              paid
                            </p>
                          ) : (
                            <p className="px-2 py-1 text-[10px] text-[#AFB2CA] border border-gray-700 rounded-full">
                              OUTSTANDING
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between p-5">
                <h4 className="text-[#848BAC] font-thin text-xs 2xl:text-base">
                  PAGE {currentPage} OF {totalPages}
                </h4>
                <div className="flex gap-2 items-center">
                  <button
                    className="text-[#848BAC] text-2xl"
                    onClick={goToPreviousPage}
                  >
                    <TiArrowLeft />
                  </button>
                  <button
                    className="text-[white] text-2xl"
                    onClick={goToNextPage}
                  >
                    <TiArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:block md:w-[30%]">
          <Image
            src="/images/profile-hero.png"
            alt="Ads"
            width={470}
            priority
            height={450}
            className="rounded-lg h-full w-full"
          />
        </div>
      </div>
    </>
  );
};

export default page;
