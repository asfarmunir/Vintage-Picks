"use client";
import { useCreateAccount } from "@/app/hooks/useCreateAccount";
import { useCreateConfirmoInvoice } from "@/app/hooks/useCreateConfirmoInvoice";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { countries } from "countries-list";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ColorRing } from "react-loader-spinner";
import { toast } from "react-hot-toast";
import { z } from "zod";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name should be atleast 2 characters",
  }),
  lastName: z.string().min(2, {
    message: "Last name should be atleast 2 characters",
  }),
  country: z.string().min(2, {
    message: "Please enter a your country name",
  }),
  phone: z.string(),
  state: z.string().min(2, {
    message: "Please enter a valid state name",
  }),
  city: z.string().min(2, {
    message: "Please enter a valid city name",
  }),
  address: z.string().min(4, {
    message: "Please enter a valid address",
  }),
  postalCode: z.string().min(4, {
    message: "Please enter a valid postal code",
  }),
});

const cardSchema = z.object({
  cardNumber: z.string().min(16, {
    message: "Please enter a valid card number",
  }),

  cardExpiry: z.string().min(4, {
    message: "Please enter a valid card expiry",
  }),
  cardCvv: z.string().min(3, {
    message: "Please enter a valid card cvv",
  }),
  country: z.string().min(2, {
    message: "Please enter a your country name",
  }),
  zipCode: z.string().min(4, {
    message: "Please enter a valid postal code",
  }),
});

const page = () => {
  // router
  const router = useRouter();

  // mutation
  const { mutate: createPaymentInvoice, isPending: loadingInvoice } = useCreateConfirmoInvoice({
    onSuccess: async (data: any) => {
      toast.success("Invoice created successfully");
      const invoice_url = `https://confirmo.net/public/invoice/${data.id}`;
      const { Invoice } = await import("@confirmo/overlay");
      const overlay = Invoice.open(
        invoice_url,
        () => {
          toast.success("Payment under review. You will be notified via email once payment is confirmed");
          router.push("/");
        },
        {
          closeAfterPaid: true,
        }
      );
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create invoice");
    },
  });

  // user details
  const { status, data: session } = useSession();

  // form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      country: "",
      phone: "",
      state: "",
      city: "",
      address: "",
      postalCode: "",
    },
  });

  const cardForm = useForm({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      country: "",
      zipCode: "",
    },
  });

  const [step, setStep] = useState<number>(1);

  useMemo(() => {
    if (typeof window === "undefined") return;
    const localStep = localStorage.getItem("step");
    setStep(localStep ? parseInt(localStep) : 1);
  }, []);

  useEffect(() => {
    const localStep = localStorage.getItem("step");
    if (step === 1 && localStep !== "2") return;
    localStorage.setItem("step", step.toString());
  }, [step]);

  // billing address form submit
  async function onSubmit(values: any) {
    // localStorage.setItem("billing", JSON.stringify(values));
    // setStep(2);
    scrollTo(0, 0);

    // const billing = JSON.parse(localStorage.getItem("billing") || "{}");
    const data = {
      account: {
        accountSize: accountSize,
        accountType:
          accountType === "2"
            ? "TWO_STEP"
            : accountType === "3"
            ? "THREE_STEP"
            : "",
        status: "CHALLENGE",
      },
      billingDetails: { ...values, email: session?.user?.email },
      customerEmail: session?.user?.email,
      invoice: {
        amount: accountPrice,
        currencyFrom: "USD",
      },
    };

    createPaymentInvoice(data);
  }

  // go back
  const goBack = () => {
    localStorage.removeItem("billing");
    localStorage.removeItem("step");
    setStep(1);
    router.push("/create-account");
  };

  // card form submit

  const handleSuccess = (data: any) => {
    localStorage.removeItem("billing");
    localStorage.removeItem("step");
    toast.success("Account created successfully");
    router.push("/dashboard");
  };

  const handleError = (error: Error) => {
    console.error(error);
    toast.error("Failed to create account");
  };

  // Mutation
  const { mutate: submitAccount, isPending } = useCreateAccount({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  async function onSubmitCard(values: any) {
    // create account
    const billing = JSON.parse(localStorage.getItem("billing") || "{}");
    const data = {
      account: {
        accountSize: accountSize,
        accountType:
          accountType === "2"
            ? "TWO_STEP"
            : accountType === "3"
            ? "THREE_STEP"
            : "",
        status: "CHALLENGE",
        accountPrice: accountPrice,
      },
      billingDetails: billing,
      card: values,
      userId: session?.user ? session?.user.id ?? "" : "",
    };

    // submit to api
    submitAccount(data);
  }

  // url search params
  const searchParams = useSearchParams();
  const accountType = searchParams.get("type");
  const accountSize = searchParams.get("accountSize");
  const accountPrice = searchParams.get("price");

  return (
    <div className=" w-full text-white flex flex-col md:flex-row md:px-16">
      <div className="flex flex-col  gap-3 p-5 md:p-8 w-full md:max-w-[30%]">
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
                ${accountPrice ? (parseInt(accountPrice.replace("$","")) + parseInt(accountPrice.replace("$",""))*0.12).toFixed(0) : accountPrice }
              </span>{" "}
              {"  "}
              {accountPrice}
            </h2>
            <p className=" text-lg 2xl:text-xl uppercase  font-semibold">
              for ${accountSize} account
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
      </div>
      <div className="flex flex-col  gap-4 p-4 md:p-8 w-full md:max-w-[70%] md:px-24">
        <div className=" w-full   flex flex-col md:flex-row md:items-center gap-8   rounded-xl ">
          <div className="flex items-center gap-2">
            <p
              className={` ${
                step === 1 ? "inner-shadow" : " bg-[#414563]"
              } 2xl:text-lg items-center flex justify-center
             font-bold w-7 2xl:w-8 h-7 2xl:h-8 rounded-full p-1 2xl:p-2 `}
            >
              1
            </p>
            <p
              className={` ${
                step === 1 ? "text-white" : "text-[#848BAC]"
              } text-lg 2xl:text-xl uppercase font-bold`}
              onClick={() => {
                step === 2 && setStep(1);
              }}
              role="button"
            >
              BiILLING DETAILS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p
              className={` ${
                step === 2 ? "inner-shadow" : " bg-[#414563]"
              } 2xl:text-lg items-center flex justify-center
             font-bold w-7 2xl:w-8 h-7 2xl:h-8 rounded-full p-1 2xl:p-2 `}
            >
              2
            </p>
            <p
              className={` ${
                step === 2 ? "text-white" : "text-[#848BAC]"
              } text-lg 2xl:text-xl uppercase font-bold`}
            >
              PAYMENT DETails
            </p>
          </div>
        </div>
        {step === 1 ? (
          <Form {...form}>
            <div
              id="first"
              className="flex flex-col  items-center justify-center w-full gap-6 md:gap-4  my-6"
            >
              <form
                id="container"
                onSubmit={form.handleSubmit(onSubmit)}
                className=" w-full "
              >
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-2 md:gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full">
                        <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            required
                            placeholder="enter your first name"
                            {...field}
                            className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full">
                        <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            required
                            placeholder=" enter your last name"
                            {...field}
                            className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-2 md:gap-4">
                  <FormItem className="mb-4 w-full">
                    <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        required
                        readOnly
                        placeholder="enter your email"
                        defaultValue={session?.user?.email}
                        className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full">
                        <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                          Phone
                        </FormLabel>
                        <FormControl>
                          <Input
                            required
                            type="number"
                            placeholder=" enter your phone number"
                            {...field}
                            className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-2 md:gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full">
                        <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                          Country
                        </FormLabel>
                        <FormControl>
                          <Select required onValueChange={field.onChange}>
                            <SelectTrigger className="  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight ">
                              <SelectValue placeholder=" select your country " />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(countries).map(
                                ([code, { name }]) => (
                                  <SelectItem key={code} value={name}>
                                    {name}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full">
                        <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                          State
                        </FormLabel>
                        <FormControl>
                          <Input
                            required
                            placeholder=" enter your state"
                            {...field}
                            className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-2 md:gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full">
                        <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                          Town/City
                        </FormLabel>
                        <FormControl>
                          <Input
                            required
                            placeholder="enter your city"
                            {...field}
                            className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full">
                        <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                          Postal Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            required
                            placeholder=" enter postal code"
                            {...field}
                            className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="mb-4 w-full">
                      <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                        Street Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder=" enter your address"
                          {...field}
                          className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-xs md:block hidden 2xl:text-sm text-[#848BAC]  font-medium  peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  By providing your information, you allow Pickshero to charge
                  your card for future payments in accordance with their terms.
                </p>

                <div className="flex w-full mt-2 gap-2 items-center justify-center">
                  <button
                    className="bg-[#333547] hidden md:block mb-4 w-fit border border-[#2a2b2a] rounded-xl hover:bg-slate-600 mt-4 text-white font-semibold py-3  px-8 2xl:text-lg   focus:outline-none focus:shadow-outline"
                    onClick={goBack}
                  >
                    BACK
                  </button>
                  <Button
                    type="submit"
                    className="bg-[#333547] mb-4 inner-shadow border border-[#28B601] w-full rounded-xl hover:bg-slate-600 mt-4 text-white font-semibold py-6 px-10 2xl:text-lg   focus:outline-none focus:shadow-outline"
                    disabled={loadingInvoice}
                  >
                    {loadingInvoice ? (
                      <ColorRing
                        visible={true}
                        height="35"
                        width="35"
                        ariaLabel="color-ring-loading"
                        wrapperStyle={{}}
                        wrapperClass="color-ring-wrapper"
                        colors={[
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ]}
                      />
                    ) : (
                      <span className=" capitalize">LET'S GO</span>
                    )}
                  </Button>
                </div>
                <p className="text-xs block md:hidden text-center 2xl:text-sm text-[#848BAC]  font-medium  peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  By providing your information, you allow Pickshero to charge
                  your card for future payments in accordance with their terms.
                </p>
              </form>
            </div>
          </Form>
        ) : (
          <Form {...cardForm}>
            <div
              id="first"
              className="flex flex-col  items-center justify-center w-full gap-6 md:gap-4  my-6"
            >
              <form
                id="container"
                onSubmit={cardForm.handleSubmit(onSubmitCard)}
                className=" w-full "
              >
                <FormField
                  control={cardForm.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem className="mb-4 w-full">
                      <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                        Card Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="  enter card number"
                          {...field}
                          className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-2 md:gap-4">
                  <FormField
                    control={cardForm.control}
                    name="cardExpiry"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full">
                        <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                          Expiry
                        </FormLabel>
                        <FormControl>
                          <Input
                            required
                            placeholder=" enter card expiry"
                            {...field}
                            className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={cardForm.control}
                    name="cardCvv"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full">
                        <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                          CVV
                        </FormLabel>
                        <FormControl>
                          <Input
                            required
                            placeholder=" enter your last name"
                            {...field}
                            className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-2 md:gap-4">
                  <FormField
                    control={cardForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full">
                        <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                          Country
                        </FormLabel>
                        <FormControl>
                          <Select required onValueChange={field.onChange}>
                            <SelectTrigger className="  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight ">
                              <SelectValue placeholder=" select your country " />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">America</SelectItem>
                              <SelectItem value="UK">UK</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={cardForm.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full">
                        <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                          Postal Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            required
                            placeholder=" enter postal code"
                            {...field}
                            className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <p className="text-xs  2xl:text-sm text-[#848BAC]  font-medium  peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  By providing your card information, you allow Pickshero to
                  charge your card for future payments in accordance with their
                  terms.
                </p>

                <div className="flex w-full mt-2 gap-2 items-center justify-center">
                  <Button
                    type="submit"
                    className="bg-[#333547] mb-4 inner-shadow border border-[#28B601] w-full rounded-xl hover:bg-slate-600 mt-4 text-white font-semibold py-6 px-10 2xl:text-lg   focus:outline-none focus:shadow-outline"
                  >
                    {isPending ? (
                      <ColorRing
                        visible={true}
                        height="35"
                        width="35"
                        ariaLabel="color-ring-loading"
                        wrapperStyle={{}}
                        wrapperClass="color-ring-wrapper"
                        colors={[
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                          "#ffffff",
                        ]}
                      />
                    ) : (
                      <span className=" capitalize">LET'S GO</span>
                    )}
                  </Button>
                </div>
                <p className="text-sm 2xl:text-base mb-4 text-gray-200 leading-snug font-semibold  peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  You will be charged $96 USD monthly until you cancel your
                  plan.
                </p>
                <p className="text-xs 2xl:text-sm text-gray-300 leading-snug font-medium  peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  By clicking purchase, your agree to our{" "}
                  <span className="text-primary-50">Terms</span> and{" "}
                  <span className="text-primary-50">Privacy Policy.</span>
                </p>
              </form>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

export default page;
