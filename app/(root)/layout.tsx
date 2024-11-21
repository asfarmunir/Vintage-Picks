"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useGetAccounts } from "../hooks/useGetAccounts";
import { accountStore } from "../store/account";
import { useGetUser } from "../hooks/useGetUser";
import { userStore } from "../store/user";
import { Account } from "@prisma/client";
import CreateAccountModal from "@/components/shared/CreateAccountModal";
import Nav from "@/components/shared/Nav";
const layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { status, data: session } = useSession();

  // User Details
  const { data: user, isPending: loadingUser } = useGetUser();
  const updateUser = userStore((state) => state.setUser);
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (!loadingUser && user) {
      updateUser(user.user);
    }
  }, [loadingUser, user, updateUser]);

  // Account store
  const updateAccount = accountStore((state) => state.setAccount);

  // User Account
  const { data: accounts, isPending } = useGetAccounts();
  const [hasAccount, setHasAccount] = useState(true);
  const pathname = usePathname();
  useEffect(() => {
    if (accounts && !isPending) {
      const previousAccountId = localStorage.getItem("account");
      const previousAccount = accounts.find(
        (account: Account) => account.id === previousAccountId
      );
      updateAccount(previousAccount || accounts[0]);
    }
    if (
      !isPending &&
      accounts.length === 0 &&
      !(pathname === "/user/profile" || pathname.split("?")[0] === "/settings")
    ) {
      setHasAccount(false);
    }
  }, [accounts, isPending, pathname]);

  return (
    <>
      <main className={` flex bg-vintage-default`}>
        {status === "authenticated" && (
          <>
            {/* <Sidebar /> */}
            <main className="flex relative flex-col px-3  overflow-x-hidden  items-start   w-full">
              <div
                className=" block sticky 
        top-0
        z-50
        w-full
        "
              >
                <Nav />
              </div>
              {/* <MobileNav /> */}
              <section className="  h-full w-full py-2.5  relative">
                {!hasAccount && <CreateAccountModal />}
                {children}
              </section>
            </main>
          </>
        )}
        {status === "loading" && (
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
        )}
      </main>
    </>
  );
};

export default layout;
