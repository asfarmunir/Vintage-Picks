"use client";
import Navbar from "@/components/shared/Navbar";
import Image from "next/image";
import React, { useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaAngleDown } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState } from "react";
import { TiArrowLeft, TiArrowRight } from "react-icons/ti";
import { MdOutlineArrowUpward } from "react-icons/md";
import { TbMessageCircleSearch } from "react-icons/tb";
import { Input } from "@/components/ui/input";
import { useGetLeaderboard } from "@/app/hooks/useGetLeaderboard";
import { getCountryCode } from "countries-list";
import ReactCountryFlag from "react-country-flag";
import { profileLevels } from "@/lib/constants";

type profileLevelName =
  | "NEWBIE"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "HERO";

const page = () => {
  const { data, isPending: loading } = useGetLeaderboard();
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<"TOP" | "BOTTOM" | "AVERAGE">("TOP");
  // pagination
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;
  const TOTAL_PAGES = Math.ceil(data?.leaderboard.length / PER_PAGE);

  const goToNextPage = () => {
    if (page === TOTAL_PAGES) return;
    setPage((page) => page + 1);
  };

  const goToPrevPage = () => {
    if (page === 1) return;
    setPage((page) => page - 1);
  };

  const filteredData = useMemo(() => {
    if(loading) return [];

    const searchFiltered = data?.leaderboard.filter((account: any) =>
      `${account.user?.firstName} ${account.user?.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    const sortedData = searchFiltered?.sort((a: any, b: any) => {
      if (sort === "TOP") {
        return a.totalFundedAmount > b.totalFundedAmount ? -1 : 1;
      } else if (sort === "BOTTOM") {
        return a.totalFundedAmount < b.totalFundedAmount ? -1 : 1;
      } else {
        return 0;
      }
    });

    const pagedData = sortedData?.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return pagedData;
  }, [data, search, sort, page]);

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
          <h1 className=" ml-4 uppercase  text-white inline-flex items-center gap-2 font-semibold 2xl:text-lg">
            <Image
              src="/icons/community.svg"
              alt="Logo"
              width={20}
              height={20}
            />
            community
          </h1>
          <Navbar />
        </div>
      </div>
      <div className=" w-full  min-h-screen flex flex-col-reverse md:flex-row  text-white  md:mt-9 gap-6 p-5 md:p-8 pb-24 mb-8 max-h-full overflow-auto">
        {loading ? (
          <div className=" w-full  min-h-[85vh]  md:w-[65%] h-full shadow-inner shadow-gray-800 flex flex-col items-center justify-center gap-5  bg-[#181926] p-4 md:p-8 rounded-xl">
            <Image
              src="/images/trophy.png"
              alt="loading"
              width={50}
              height={50}
            />
            <h3 className=" font-bold text-lg text-[#848BAC]">
              Leaderboards coming soon....
            </h3>
          </div>
        ) : (
          <div className=" w-full  md:w-[65%] h-full shadow-inner shadow-gray-800 flex flex-col gap-7  bg-[#181926] p-4 md:p-8 rounded-xl">
            <div className=" w-full items-center flex justify-between">
              <h2 className=" text-2xl 2xl:text-3xl font-bold uppercase text-white">
                LEADERBOARDS
              </h2>
            </div>

            <div className=" w-full space-y-5 bg-primary-100   rounded-2xl  mb-8">
              <div className=" w-full border border-gray-700 rounded-xl  flex flex-col">
                <div className="flex items-center gap-3 w-full p-2 md:p-6 md:pr-32 ">
                  <DropdownMenu>
                    <DropdownMenuTrigger className=" bg-[#393C53]    justify-center text-nowrap w-fit  text-xs md:text-sm px-3 md:px-4 py-3 font-bold rounded-lg inline-flex items-center gap-2">
                      {sort} EARNERS
                      <FaAngleDown className=" text-lg" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48  bg-[#181926] text-white border-none  mt-1  p-3 rounded-lg shadow-sm">
                      <DropdownMenuItem
                        className="flex items-center justify-between"
                        onClick={() => setSort("TOP")}
                      >
                        <p>TOP EARNERS</p>

                        <MdOutlineArrowUpward className="text-lg" />
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="flex items-center justify-between "
                        onClick={() => setSort("AVERAGE")}
                      >
                        <p>AVERAGE</p>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center justify-between "
                        onClick={() => setSort("BOTTOM")}
                      >
                        <p>BOTTOM EARNERS</p>
                        <MdOutlineArrowUpward className="text-lg rotate-180" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>{" "}
                  <div className=" bg-[#333547]/60 inline-flex md:flex-grow items-center py-1 px-2 rounded-lg">
                    <LuSearch className="w-7 h-7 text-[#848BAC] " />
                    <Input
                      className=" bg-transparent text-white focus:outline-0 focus:ring-0 focus:border-none placeholder-slate-900 uppercase"
                      placeholder={"search..."}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <Table>
                  {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                  <TableHeader className=" bg-[#333547] text-[#848BAC] border-none">
                    <TableRow className=" border-none">
                      <TableHead className="uppercase  font-bold text-center">
                        position
                      </TableHead>
                      <TableHead className="uppercase font-bold text-start">
                        name
                      </TableHead>
                      <TableHead className="uppercase font-bold text-center">
                        level
                      </TableHead>
                      <TableHead className="uppercase font-bold text-center">
                        country
                      </TableHead>
                      <TableHead className="uppercase font-bold text-start">
                        earnings
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className=" ">
                    {
                      !loading && filteredData?.length === 0 && (
                        <TableRow className="border-none">
                          <TableCell className="text-center" colSpan={5}>
                            <h2 className="text-white uppercase font-bold">
                              No data available
                            </h2>
                          </TableCell>
                        </TableRow>
                      )
                    }
                    
                    {!loading &&
                      filteredData?.map((account: any, index: number) => (
                        <TableRow className="" key={account.userId}>
                          <TableCell className="  max-w-[100px] py-5 border-b border-gray-700 ">
                            <div className="font-semibold text-xs   2xl:text-base flex mt-0.5 items-center justify-center ">
                              <Image
                                src="/icons/polygon.png"
                                alt="profile"
                                width={30}
                                className="relative"
                                height={30}
                              />
                              <p className=" absolute text-primary-50 font-bold">
                                {account.rank}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="  max-w-[140px] w-full font-bold uppercase text-xs py-5 border-b border-gray-700 2xl:text-base   ">
                            <div className="flex items-center  gap-2">
                              <Image
                                src="/icons/avatar.png"
                                alt="profile"
                                width={25}
                                height={25}
                              />
                              {`${account.user?.firstName} ${account.user?.lastName}`}
                            </div>
                          </TableCell>
                          <TableCell className="  max-w-[100px]  py-5 border-b border-gray-700 ">
                            <div className=" 2xl:text-base mx-auto flex justify-center mt-0.5 ">
                              <Image
                                src={
                                  profileLevels[
                                    account?.user
                                      ?.profileLevel as profileLevelName
                                  ]?.icon
                                }
                                alt="profile"
                                width={25}
                                height={25}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="  max-w-[100px] font-bold capitalize text-xs py-5 border-b border-gray-700 2xl:text-base  ">
                            <div className="flex justify-center">
                              <ReactCountryFlag
                                countryCode={
                                  getCountryCode(account.user.country) as string
                                }
                                svg
                                style={{
                                  width: "25px",
                                  height: "25px",
                                }}
                                className="rounded-full object-cover"
                                title={account.user.country}
                              />
                            </div>
                          </TableCell>

                          <TableCell className=" font-bold max-w-[120px] capitalize text-xs py-5 border-b border-gray-700 2xl:text-base text-start truncate">
                            ${account.totalFundedAmount}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between p-5">
                  <h4 className="text-[#848BAC] font-thin text-xs 2xl:text-base ">
                    PAGE {page} OF {TOTAL_PAGES}
                  </h4>
                  <div className="flex gap-2 items-center">
                    <button
                      className="text-[#848BAC] text-2xl"
                      onClick={goToPrevPage}
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
        )}

        <div className="   md:w-[40%] flex flex-col gap-4 mb-8  ">
          <div className="shadow-inner shadow-gray-800 px-5 py-10  flex flex-col gap-2.5 rounded-xl  bg-[#181926] relative">
            <Image
              src="/images/bg-grad.png"
              alt="community"
              width={370}
              priority
              height={370}
              className=" absolute  top-0 right-5"
            />
            <Image
              src="/images/discord.png"
              alt="community"
              priority
              width={130}
              height={130}
              className=" mx-auto mb-5 z-30"
            />
            <h2 className="font-bold text-lg 2xl:text-xl uppercase">
              Join our Discord community
            </h2>
            <p className="inline-flex items-center gap-2">
              <Image
                src="/images/pick.png"
                alt="discord"
                width={25}
                height={25}
              />
              <span className="font-bold">PROFFESSIONAL PICKS</span>
            </p>
            <p className="inline-flex items-center gap-2">
              <Image
                src="/images/call.png"
                alt="discord"
                width={25}
                height={25}
              />
              <span className="font-bold">LIVE CALLS</span>
            </p>
            <p className="inline-flex items-center gap-2">
              <Image
                src="/images/giveaway.png"
                alt="discord"
                width={25}
                height={25}
              />
              <span className="font-bold">HUGE GIVEAWAYS</span>
            </p>
            <a href="http://discord.gg/pickshero" target="_blank" rel="noreferrer" className="text-center w-full py-2.5 rounded-lg my-3 inner-shadow font-bold">
              JOIN DISCORD
            </a>
          </div>
          <div className="flex gap-4 ">
            <a href="https://www.youtube.com/@PicksHero" target="_blank" rel="noreferrer" className="shadow-inner  md:mb-16 flex-grow  shadow-gray-800 p-7  items-center justify-center flex flex-col gap-2.5 rounded-xl  bg-[#181926]">
              <Image
                src="/images/youtube.png"
                alt="community"
                width={73}
                priority
                height={73}
                className=" mb-2 object-contain object-center"
              />
              <h3 className="font-bold text-xl">SUBSCRIBE</h3>
            </a>
            <a href="http://Instagram.com/picks.hero" target="_blank" rel="noreferrer" className="shadow-inner  md:mb-16  flex-grow items-center justify-center  shadow-gray-800 p-7  flex flex-col gap-2.5 rounded-xl  bg-[#181926]">
              <Image
                src="/images/instagram.png"
                alt="community"
                width={65}
                priority
                height={65}
                className=" object-contain object-center"
              />
              <h3 className="font-bold text-xl">FOLLOW</h3>
            </a>
            <a href="https://x.com/picksheroo" target="_blank" rel="noreferrer" className="shadow-inner  md:mb-16  flex-grow items-center justify-center  shadow-gray-800 p-7  flex flex-col gap-2.5 rounded-xl  bg-[#181926]">
              <Image
                src="/images/x.jpg"
                alt="community"
                width={62}
                priority
                height={62}
                className=" object-contain object-center rounded-md"
              />
              <h3 className="font-bold text-xl">FOLLOW</h3>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
