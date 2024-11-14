"use client";
import MobileNav from "@/components/shared/MobileNav";
import Sidebar from "@/components/shared/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
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
              <section className="  h-full w-full pt-2 md:pt-0 relative">
                {/* {!hasAccount && <CreateAccountModal />} */}
                {children}
              </section>
            </main>
          </>
        )}
        {status === "loading" && <p>isLoading...</p>}
      </main>
    </>
  );
};

export default layout;
