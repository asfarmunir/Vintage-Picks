'use client'
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React ,{useEffect, useState} from "react";
import { getServerSession } from "next-auth";
// import { AuthOptions } from "@/app/api/auth/AuthOptions";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const challenge = [
  {
    title: "Profit Target 20%",
    icons: "/icons/profit.png",
  },
  {
    title: "MAXIMUM LOSS",
    icons: "/icons/loss.png",
  },
  {
    title: "MAXIMUM DAILY LOSS",
    icons: "/icons/loss2.png",
  },
  {
    title: "Duration X Days",
    icons: "/icons/duration.png",
  },
  {
    title: "Minimum Number of Bets 20",
    icons: "/icons/check-green.png",
  },
  {
    title: "Maximum Bet Size 2% of initial capital",
    icons: "/icons/check-green.png",
  },
];

interface Steps {
  title: string;
  price: string;
};

const two_step: Steps[] = [
  {
    title: "1K",
    price: "$34",
  },
  {
    title: "2K",
    price: "$72",
  },
  {
    title: "5K",
    price: "$159",
  },
  {
    title: "10K",
    price: "$309",
  },
  {
    title: "20K",
    price: "$559",
  },
  {
    title: "50K",
    price: "$1308",
  },
];

const three_step: Steps[] = [
  {
    title: "2K",
    price: "$34",
  },
  {
    title: "5K",
    price: "$72",
  },
  {
    title: "10K",
    price: "$159",
  },
  {
    title: "20K",
    price: "$309",
  }
];

const Page = () => {
  // session
  const router = useRouter();
  const { status, data: session } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }

    // clear billing address
    localStorage.removeItem('billing');
    localStorage.removeItem('step');

  }, [status, router]);


  // account sizes
  const [activeStep, setActiveStep] = useState<number>(2);
  const [accountSizes, setAccountSizes] = useState<Steps[]>(two_step);
  const [activeAccountSize, setActiveAccountSize] = useState<Steps>(two_step[0]);

  const changeActiveStep = (step: number) => {
    setActiveStep(step);
    if (step === 2) {
      setAccountSizes(two_step);
      setActiveAccountSize(two_step[0]);
    } else if (step === 3) {
      setAccountSizes(three_step);
      setActiveAccountSize(three_step[0]);
    }
  };

  // form
  const openForm = () => {
    router.push(`/create-account/form/?type=${activeStep}&accountSize=${activeAccountSize.title}&price=${activeAccountSize.price}`);
  };

  return (
    <>
    {status === 'authenticated' &&  <section className=" w-full flex flex-col md:flex-row text-white ">
      <div className="flex flex-col  gap-4 p-4 md:p-8 w-full md:max-w-[70%]">
        <h2 className=" text-xl md:text-3xl font-bold uppercase">
          Unlock Our Money To Bet With
        </h2>
        <p className=" text-[#848BAC] font-semibold ">
          Get paid 50% of the profits you make.
        </p>
        <div className=" w-full bg-[#181926]  flex flex-col md:flex-row md:items-center gap-6 px-8 py-7 rounded-xl shadow-inner shadow-gray-800">
          <div className="flex items-center gap-2">
            <p className=" 2xl:text-lg items-center flex justify-center font-bold w-7 2xl:w-8 h-7 2xl:h-8 rounded-full p-1 2xl:p-2 inner-shadow">
              1
            </p>
            <p className=" text-lg 2xl:text-xl font-bold">
              TAKE YOUR CHALLENGE
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className=" 2xl:text-lg items-center flex justify-center font-bold w-7 2xl:w-8 h-7 2xl:h-8 rounded-full p-1 2xl:p-2 inner-shadow">
              2
            </p>
            <p className=" text-lg 2xl:text-xl font-bold">UNLOCK CAPITAL</p>
          </div>
          <div className="flex items-center gap-2">
            <p className=" 2xl:text-lg items-center flex justify-center font-bold w-7 2xl:w-8 h-7 2xl:h-8 rounded-full p-1 2xl:p-2 inner-shadow">
              3
            </p>
            <p className=" text-lg 2xl:text-xl font-bold">PICK & GET PAID</p>
          </div>
        </div>
        <div className=" w-full bg-[#181926]  flex flex-col gap-1 px-8 py-7 rounded-xl shadow-inner shadow-gray-800">
          <h2 className="text-lg 2xl:text-xl font-bold "> Challenge</h2>
          <p className=" text-[#848BAC] text-sm md:text-base font-semibold ">
            Select if you want to complete the Challenge in one or two identical
            steps
          </p>

          <div className="flex items-center flex-col md:flex-row mt-10  gap-5 md:mt-4">
            <div className={`text-2xl relative w-full md:w-fit flex justify-center hover:bg-[#1A5B0B] border-2 border-gray-800 cursor-pointer hover:border-2 hover:border-[#52FC18] font-bold px-8 py-2.5 rounded-full ${activeStep===2 ? "bg-[#1A5B0B] border-2 !border-[#52FC18]":""}`}
              onClick={() => changeActiveStep(2)}
            >
              2 STEP
              <Image
                src="/images/faster.png"
                alt="2 step"
                width={70}
                height={70}
                className=" absolute -top-2.5"
              />
            </div>
            <div className={`text-2xl relative w-full md:w-fit flex items-center justify-center  hover:bg-[#1A5B0B] border-2 border-gray-800 cursor-pointer hover:border-2 hover:border-[#52FC18] font-bold px-8 py-2.5 rounded-full ${activeStep===3 ? "bg-[#1A5B0B] border-2 !border-[#52FC18]":""}`}
              onClick={() => changeActiveStep(3)}
            >
              3 STEP
              <Image
                src="/images/cheaper.png"
                alt="3 step"
                width={70}
                height={70}
                className=" absolute -top-2.5"
              />
            </div>
          </div>
        </div>
        <div className=" w-full bg-[#181926]  flex flex-col gap-1 px-8 py-7 rounded-xl shadow-inner shadow-gray-800">
          <h2 className="text-lg 2xl:text-xl font-bold "> ACCOUNT SIZE</h2>
          <div className="flex items-center flex-col md:flex-row mt-10  gap-5 md:mt-4">
            {
              accountSizes.map((item, index) => (
                <div key={index} className={`text-2xl relative w-full md:w-fit flex items-center justify-center  hover:bg-[#1A5B0B] border-2 border-gray-800 cursor-pointer hover:border-2 hover:border-[#52FC18] font-bold px-6 py-2.5 rounded-full ${activeAccountSize.title === item.title ? "bg-[#1A5B0B] border-2 !border-[#52FC18]":""}`}
                  onClick={() => setActiveAccountSize(item)}
                >
                  {item.title}
                </div>
              ))
            }
          </div>
        </div>
      </div>
      <div className="flex flex-col  gap-3 p-5 md:p-8 w-full md:max-w-[30%]">
        <h2 className=" text-xl md:text-3xl font-bold uppercase">
          REFUNDABLE FEE
        </h2>
        {/* <p className="text-xs inline-flex w-full bg-[#52FC18]/15 rounded-xl gap-3 border border-[#52FC18]/20 py-2 px-3 items-center 2xl:text-sm text-[#F74418] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          <Image
            src="/icons/refund.svg"
            alt="line"
            width={20}
            height={20}
            className=""
          />
          <span className=" text-[#52FC18]">
            20% OFF Summer Sale. Ending Friday
          </span>
        </p> */}
        <div className=" w-full bg-[#181926]  flex flex-col md:flex-row md:items-center gap-6 px-8 py-7 rounded-xl shadow-inner shadow-gray-800">
          <div className="flex flex-col items-center ">
            <h2 className=" 2xl:text-4xl text-3xl  tracking-wide font-black ">
              <span className=" line-through text-[#848BAC]  ">
                ${ (parseInt(activeAccountSize.price.replace("$", ""))*0.12 + parseInt(activeAccountSize.price.replace("$", ""))).toFixed(0)}
              </span>{" "}
              {"  "}
              { activeAccountSize.price }
            </h2>
            <p className=" text-lg 2xl:text-xl uppercase  font-semibold">
              for ${activeAccountSize.title} account
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className=" inline-flex items-center gap-2">
            <Image
              src="/icons/check-green.png"
              alt="line"
              width={20}
              height={20}
              className=""
            />
            <h2 className=" font-bold text-sm 2xl:text-base text-nowrap uppercase">
              One-Time Fee
            </h2>
          </div>
          <div className=" inline-flex items-center gap-2">
            <Image
              src="/icons/refund.png"
              alt="line"
              width={20}
              height={20}
              className=""
            />
            <h2 className=" font-bold text-sm 2xl:text-base text-nowrap uppercase">
              100% Refundable
            </h2>
          </div>
        </div>
        <button
          onClick={openForm}
          className=" mb-1 inner-shadow border text-center border-[#28B601] w-full rounded-xl hover:bg-slate-600 mt-4 text-white font-semibold py-3 px-10 2xl:text-lg   focus:outline-none focus:shadow-outline"
        >
          <span className=" capitalize">GET STARTED</span>
        </button>
        <p className="text-xs 2xl:text-sm text-gray-300 leading-snug font-medium  peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          By clicking purchase, your agree to our{" "}
          <span className="text-primary-50">Terms</span> and{" "}
          <span className="text-primary-50">Privacy Policy.</span>
        </p>

        <div className=" w-full bg-[#181926] mt-4  flex flex-col gap-1 px-6 py-7 rounded-xl shadow-inner shadow-gray-800">
          <h2 className="text-lg 2xl:text-xl font-bold uppercase ">
            {" "}
            The Pickshero Challenge
          </h2>
          <div className="flex  flex-col  mt-6  gap-2.5 md:mt-4">
            {challenge.map((item, index) => (
              <div key={index} className="flex gap-2 md:gap-4 items-center ">
                <Image
                  src={item.icons}
                  alt="line"
                  width={20}
                  height={20}
                  className=""
                />
                <h2 className=" font-bold text-xs 2xl:text-base  uppercase">
                  {item.title}
                </h2>
              </div>
            ))}
            <div className="bg-[#333547] text-sm border border-[#21222e] w-full rounded-xl hover:bg-slate-600 mt-4 text-white font-semibold py-3 text-center px-10 2xl:text-lg   focus:outline-none focus:shadow-outline">
              <span className=" capitalize">Click here for more info</span>
            </div>
          </div>
        </div>
      </div>
    </section>}
    </>);
  };

export default Page;
