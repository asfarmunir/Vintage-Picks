"use client";
import { useGetUser } from "@/app/hooks/useGetUser";
import { useSignAgreement } from "@/app/hooks/useSignAgreement";
import { Button } from "@/components/ui/button";
import { DownloadIcon, LoaderCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Agreements() {
  const { data, refetch, isPending: loading } = useGetUser();
  const { mutate: signAgreement, isPending } = useSignAgreement({
    onSuccess: () => {
      refetch()
      toast.success("Agreement signed successfully");
    },
    onError: (error) => {
      toast.error("An error occurred while signing agreement");
    },
  });
  const [activeAgrrement, setActiveAgreement] = useState<0 | 1 | 2 | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = (agreementNumber: 0 | 1 | 2) => {
    setActiveAgreement(agreementNumber);
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSignAgreement = () => {
    let data;
    if (activeAgrrement === 0) {
      data = {
        field: "agreement1",
        value: true,
      };
    } else if (activeAgrrement === 1) {
      data = {
        field: "agreement2",
        value: true,
      };
    } else if (activeAgrrement === 2) {
      data = {
        field: "agreement3",
        value: true,
      };
    }

    signAgreement(data);

    setIsModalOpen(false);
  };

  if(loading)   {
    return (
        <div className="w-full h-full flex justify-center items-center gap-2">
            <LoaderCircle className="animate-spin" />
            Loading...
        </div>
    )
  }
  
  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleSignAgreement}
        isPending={isPending}
      />
      <div className=" w-full flex text-white flex-col gap-4">
        <div className=" w-full flex justify-between items-start flex-wrap py-4 pb-8 gap-y-4 border-b border-gray-700">
          <div className="flex flex-col gap-1">
            <h3 className=" text-lg uppercase font-bold">Funded Agreement</h3>

            <p className="text-sm text-[#848BAC] tracking-wide ">
              By signing this, you are agreeing to picks hero funded account policies.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 flex-grow sm:flex-grow-0">
            <Button
              className="bg-[#333547] inner-shadow border w-full md:w-fit border-[#28B601]  rounded-xl hover:bg-slate-600 text-white font-semibold p-6  2xl:text-lg   focus:outline-none focus:shadow-outline"
              disabled={data.user?.agreement1}
              onClick={() => handleModalOpen(0)}
            >
              <span className="uppercase text-xs">
                {data.user?.agreement1 ? "Agreement Signed" : "Sign Agreement"}
              </span>
            </Button>
            <a
              href="/agreements/PH Agreement Funded.pdf"
              className="bg-[#333547] w-full md:w-fit rounded-xl hover:bg-slate-600 text-white font-semibold px-6 2xl:text-lg focus:outline-none focus:shadow-outline flex gap-2 justify-center items-center py-4"
              download
            >
              <DownloadIcon className="w-4 h-4" />
              <span className="uppercase text-xs">Download</span>
            </a>
          </div>
        </div>

        <div className="w-full flex justify-between items-start flex-wrap py-4 pb-8 gap-y-4 ">
          <div className="flex flex-col gap-1">
            <h3 className=" text-lg uppercase font-bold">Non-Disclosure Agreement</h3>

            <p className="text-sm text-[#848BAC] tracking-wide ">
              By signing this, you are agreeing to picks hero non-disclosure agreement.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 flex-grow sm:flex-grow-0">
            <Button
              className="bg-[#333547] inner-shadow border w-full md:w-fit border-[#28B601]  rounded-xl hover:bg-slate-600 text-white font-semibold p-6  2xl:text-lg   focus:outline-none focus:shadow-outline"
              disabled={data.user?.agreement2}
              onClick={() => handleModalOpen(1)}
            >
              <span className="uppercase text-xs">
                {data.user?.agreement2 ? "Agreement Signed" : "Sign Agreement"}
              </span>
            </Button>
            <a
              href="/agreements/NDA Funded PH.pdf"
              className="bg-[#333547] w-full md:w-fit rounded-xl hover:bg-slate-600 text-white font-semibold px-6 2xl:text-lg focus:outline-none focus:shadow-outline flex gap-2 justify-center items-center py-4"
              download
            >
              <DownloadIcon className="w-4 h-4" />
              <span className="uppercase text-xs">Download</span>
            </a>
          </div>
        </div>
        {/* <div className=" w-full flex justify-between items-start flex-wrap py-4 pb-8 gap-y-4 ">
          <div className="flex flex-col gap-1">
            <h3 className=" text-lg uppercase font-bold">Agreement 3</h3>

            <p className="text-sm text-[#848BAC] tracking-wide max-w-md ">
              Agreement 3 Description
            </p>
          </div>
          <div className="flex flex-wrap gap-2 flex-grow sm:flex-grow-0">
            <Button
              className="bg-[#333547] inner-shadow border w-full md:w-fit border-[#28B601]  rounded-xl hover:bg-slate-600 text-white font-semibold p-6  2xl:text-lg   focus:outline-none focus:shadow-outline"
              disabled={data.user?.agreement3}
              onClick={() => handleModalOpen(2)}
            >
              <span className="uppercase text-xs">
                {data.user?.agreement3 ? "Agreement Signed" : "Sign Agreement"}
              </span>
            </Button>
            <a
              href="#"
              className="bg-[#333547] w-full md:w-fit rounded-xl hover:bg-slate-600 text-white font-semibold px-6 2xl:text-lg focus:outline-none focus:shadow-outline flex gap-2 justify-center items-center py-4"
              download
            >
              <DownloadIcon className="w-4 h-4" />
              <span className="uppercase text-xs">Download</span>
            </a>
          </div>
        </div> */}
      </div>
    </>
  );
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div className="bg-primary-100 w-full max-w-lg p-8 rounded-xl mx-6">
        <h2 className="text-xl font-bold mb-4 text-center uppercase">
          Are you sure?
        </h2>
        <p className="text-gray-400 mb-6 text-center">
          Are you sure you want to sign this agreement?
        </p>
        <div className="flex justify-center items-center gap-4">
          <Button
            onClick={onClose}
            className="bg-[#333547] w-full md:w-fit rounded-xl hover:bg-slate-600 text-white font-semibold p-6 focus:outline-none focus:shadow-outline gap-2  text-xs uppercase"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-[#333547] inner-shadow border w-full md:w-fit border-[#28B601] rounded-xl hover:bg-slate-600 text-white font-semibold p-[22px]   focus:outline-none focus:shadow-outline text-xs uppercase"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex gap-2 items-center">
                <LoaderCircle className="animate-spin" />
                Signing...
              </div>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
