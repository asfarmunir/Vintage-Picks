"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navlinks } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { userStore } from "@/app/store/user";
import { useGetUser } from "@/app/hooks/useGetUser";
import { GoBellFill } from "react-icons/go";
import { useState, useEffect } from "react";
import { IoIosSettings } from "react-icons/io";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetNotifications } from "@/app/hooks/useGetNotifications";
import { LoaderCircle } from "lucide-react";
import { accountStore } from "@/app/store/account";
import { Notification } from "@prisma/client";
import { useMarkNotification } from "@/app/hooks/useMarkNotification";
import toast from "react-hot-toast";
import UserAccount from "./UserAccount";
import { IoChevronDownCircle } from "react-icons/io5";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const user = userStore((state) => state.user);

  const account = accountStore((state) => state.account);
  const { mutate: markAsRead } = useMarkNotification({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error("An error occurred while marking as read");
    },
  });
  const { data, isPending, refetch } = useGetNotifications();
  const [hasUnread, setHasUnread] = useState(false);

  // Web Socket
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:443?userId=${account.userId}`);
    ws.onopen = () => {
      console.log("connected");
    };
    ws.onmessage = (msg) => {
      console.log(msg);
      refetch();
    };
    ws.onclose = () => {
      console.log("disconnected");
    };
  }, []);

  useEffect(() => {
    if (!data) return;
    if (
      data.notifications.length > 0 &&
      data.notifications.some(
        (notification: Notification) => !notification.read
      )
    ) {
      setHasUnread(true);
    }
  }, [data]);

  const markNotifications = () => {
    markAsRead({
      onSuccess: () => {
        refetch();
      },
      onError: (error: any) => {
        toast.error("An error occurred while marking as read");
      },
    });
    setHasUnread(false);
  };

  return (
    <>
      <div
        className={`relative m-3 first-letter: rounded-3xl bg-vintage-50 w-[98.5%]  transition-all duration-300 

          flex items-center justify-between  gap-7 2xl:gap-10 p-4 2xl:p-6`}
      >
        <div className="flex items-center gap-5">
          <Image
            src={"/vintage/images/logo.svg"}
            alt="logo"
            width={50}
            height={50}
            priority
          />

          <div className="flex  gap-1.5">
            {navlinks.map((link, index) => (
              <Link
                key={index}
                href={link.link}
                className={`inline-flex  capitalize  
                  text-sm 2xl:text-base   
                ${
                  pathname === link.link
                    ? "text-white  bg-[#FFFFFF33] font-semibold px-5 py-1 2xl:px-6  2xl:py-2  rounded-3xl"
                    : "text-[#FFFFFFCC] font-normal hover:bg-white/10 px-3 py-1 2xl:px-4  2xl:py-2  rounded-3xl"
                }
                items-center gap-2 `}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserAccount />
          <button className=" data-[state=open]:border-2 bg-[#FFFFFF1A]  data-[state=open]:shadow  data-[state=open]:border-vintage-50/50   bg-[#272837]  font-semibold   justify-center text-nowrap w-full md:w-fit  text-xs md:text-sm px-1.5 md:px-1.5 py-1.5 2xl:py-1.5  rounded-full inline-flex items-center gap-2">
            <Image
              src={"/vintage/images/avatar.svg"}
              alt="User Avatar"
              width={35}
              height={35}
              className="rounded-full hover:cursor-pointer"
            />
            <span className="  text-white capitalize flex gap-2 items-center text-xs 2xl:text-sm  px-1 py-2">
              {`${user.firstName} ${user.lastName}`}
              <IoChevronDownCircle className="w-5 text-white h-5" />
            </span>
          </button>

          {/* <Link
            href={"/user/profile"}
            className=" border-t border-gray-600 bg-gray-900 hover:cursor-pointer rounded-md p-1.5 px-2 text-white text-4xl"
          >
            <Image
              src="/icons/profile.svg"
              alt="User Avatar"
              width={20}
              height={20}
              className="rounded-full hover:cursor-pointer"
            />
          </Link> */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative">
              <GoBellFill className=" border-t border-gray-600 rounded-full bg-[#FFFFFF1A] hover:cursor-pointer  p-1.5 px-2 text-white text-4xl" />
              {!isPending && hasUnread && (
                <>
                  <div className="absolute top-1 right-1.5 mt-1 mr-1 bg-blue-600 text-white text-xs font-bold rounded-full h-2 w-2 flex items-center justify-center" />
                  <div className="absolute top-1 right-1.5 mt-1 mr-1 bg-blue-700 text-white text-xs font-bold rounded-full h-2 w-2 flex items-center justify-center animate-ping" />
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" md:w-[22rem]  2xl:w-96 max-h-[470px] 2xl:max-h-[540px] z-50 overflow-y-auto  text-white bg-[#272837] mr-8 md:mr-36 border-none py-5 mt-1   rounded-xl  shadow-inner shadow-gray-700">
              <div className=" w-full items-center flex justify-between border-b  border-gray-700  pb-4 mb-2">
                <h3 className=" text-lg font-bold px-3.5">Notifications</h3>
                <button
                  className=" text-sm inline-flex gap-1 items-center font-bold text-primary-50 px-3.5"
                  onClick={markNotifications}
                >
                  <Image
                    src="/icons/mark-as-read.svg"
                    alt="Mark All"
                    width={16}
                    height={16}
                  />
                  Mark read
                </button>
              </div>

              {isPending && (
                <div className="flex hover:bg-[#333547]/20 items-center justify-start my-4 py-3 px-3.5">
                  <LoaderCircle className="animate-spin" />
                  Loading...
                </div>
              )}

              {!isPending && data.notifications?.length === 0 && (
                <div className="flex hover:bg-[#333547]/20 items-center justify-start my-4 py-3 px-3.5">
                  <Image
                    src="/images/notification.svg"
                    alt="Client"
                    width={50}
                    height={50}
                  />
                  <div className="flex flex-col ml-3">
                    <p className="font-bold">No new notifications</p>
                  </div>
                </div>
              )}

              {!isPending &&
                data.notifications?.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className="flex hover:bg-[#333547]/20 items-center justify-start my-4 py-3 px-3.5"
                  >
                    <Image
                      src="/icons/marked.png"
                      alt="Client"
                      width={50}
                      height={50}
                    />
                    <div className="flex flex-col ml-3">
                      <p className="font-bold">{notification.content}</p>
                      <span className=" text-sm text-slate-400/60">
                        {new Date(notification.createdAt).toUTCString()}
                      </span>
                    </div>
                  </div>
                ))}

              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href={"/settings"}>
            <IoIosSettings className=" border-t border-gray-600 rounded-full bg-[#FFFFFF1A] hover:cursor-pointer  p-1.5 px-2 text-white text-4xl" />
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
