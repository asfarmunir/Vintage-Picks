import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CreateAccountModal() {
  const pathname = usePathname();

  return (
    (pathname === "/dashboard" || pathname === "/picks") && (
      <div className="absolute w-full inset-0 flex justify-center items-center backdrop-blur-sm bg-black/50 z-50">
        <div className="text-white relative border-none p-8 pb-48 md:pb-12 overflow-hidden min-h-48 2xl:min-h-56 rounded-2xl w-[95%] max-w-screen-xl bg-primary-100 flex justify-between gap-3 [&_button:has(svg)]:hidden">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-start items-end sm:flex-row h-full sm:items-center gap-2">
              <h1 className="text-3xl 2xl:text-4xl font-bold text-pretty">
                BET SPORTS WITH OUR
              </h1>
              <Image
                src="/images/money.png"
                alt="Football Icon"
                width={110}
                className="mr-12 sm:mr-0 sm:mt-0 2xl:w-[130px] 2xl:ml-1"
                height={110}
              />
            </div>
            <p className=" text-[#AFB2CA] mb-3 mt-4 md:mt-0 2xl:text-lg font-semibold">
              Lower risk, higher rewards, bet with our capital
            </p>
            <Link
              href={"/create-account"}
              className="text-white uppercase font-bold w-fit text-sm rounded-xl inner-shadow px-6 py-3 inline-flex items-center gap-3 hover:opacity-75"
            >
              Add Account
            </Link>
          </div>
          <Image
            src="/images/hero.png"
            alt="Hero Image"
            width={700}
            height={700}
            className=" absolute bottom-0 right-0  md:-right-20 md:-bottom-28 2xl:w-[840px] 2xl:-bottom-32"
          />
        </div>
      </div>
    )
  );
}
