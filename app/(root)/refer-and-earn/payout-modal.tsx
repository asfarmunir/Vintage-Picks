"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { usePostReferPayout } from "@/app/hooks/usePostReferPayout";
import { toast } from "react-hot-toast";

// Define TypeScript enum for Currency
enum Currency {
  USDT = "USDT ERC20",
  ETH = "ETH ERC20",
}

// Define the Zod schema for validation
const payoutSchema = z.object({
  currency: z.enum([Currency.USDT, Currency.ETH], {
    required_error: "Please select a currency",
  }),
  networkAddress: z
    .string()
    .nonempty("Network address is required")
    .min(5, "Network address must be at least 5 characters long"),
});

type PayoutFormInputs = z.infer<typeof payoutSchema>;

export default function PayoutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PayoutFormInputs>({
    resolver: zodResolver(payoutSchema),
  });

  const { mutate: requestPayout, isPending } = usePostReferPayout({
    onSuccess: () => {
      toast.success("Payout request submitted successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit payout request");
    },
  });

  const onSubmit = async (data: PayoutFormInputs) => {
    if (errors.currency || errors.networkAddress) return;

    const payoutReqData = {
      currency: data.currency === Currency.USDT ? "USDT_ERC20" : "ETH_ERC20",
      networkAddress: data.networkAddress,
    };

    await requestPayout(payoutReqData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-primary-100 gap-1 p-5 text-white border-none">
        <DialogTitle className="bg-primary-100 text-white border-none mb-8">
          Request Payout
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Crypto Currency Selection */}
          <div>
            <label htmlFor="currency" className="text-sm">
              Crypto Currency
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`bg-transparent border border-white border-opacity-10 w-full text-left p-2 rounded-md text-sm ${
                  selectedCurrency ? "text-white" : "text-white/40"
                } ${errors.currency ? "border-red-500" : ""}`}
              >
                {selectedCurrency ? selectedCurrency : "Select Currency"}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                id="currency"
                className="bg-primary-100 text-white border-white/20"
              >
                <DropdownMenuItem
                  onSelect={() => {
                    setSelectedCurrency(Currency.USDT);
                    setValue("currency", Currency.USDT);
                  }}
                >
                  {Currency.USDT}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setSelectedCurrency(Currency.ETH);
                    setValue("currency", Currency.ETH);
                  }}
                >
                  {Currency.ETH}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {errors.currency && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currency.message}
              </p>
            )}
          </div>

          {/* Network Address Input */}
          <div>
            <label htmlFor="network-address" className="text-sm">
              Network Address
            </label>
            <Input
              id="network-address"
              placeholder="Enter Network Address"
              className={`bg-transparent text-white border border-white border-opacity-10 ${
                errors.networkAddress ? "border-red-500" : ""
              }`}
              {...register("networkAddress")}
            />
            {errors.networkAddress && (
              <p className="text-red-500 text-sm mt-1">
                {errors.networkAddress.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-end gap-4">
            <button
              type="button"
              className="text-white font-semibold hover:outline hover:outline-1 hover:outline-primary-200 uppercase text-xs bg-[#333547] p-3.5 rounded-lg shadow-inner shadow-gray-500 inline-flex items-center gap-3"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="submit"
              className="p-3.5 uppercase font-bold inner-shadow text-xs text-white rounded-lg hover:outline hover:outline-1 hover:outline-coral-500 bg-[#52FC18]/20 disabled:opacity-20"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Request Payout"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
