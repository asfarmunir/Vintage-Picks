"use client";
import Image from "next/image";
import { createRef, useState } from "react";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import ReCAPTCHA from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import { ColorRing } from "react-loader-spinner";
import * as z from "zod";
import toast, { Toaster } from "react-hot-toast";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password should be atleast 6 characters",
  }),
});

const page = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [toggle, setToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [AuthError, setAuthError] = useState("");
  interface value {
    email: string;
    password: string;
  }
  const router = useRouter();
  async function onSubmit(values: value) {
    setIsLoading(true);

    // try {
    //   recaptchaRef.current.reset();
    //   const token = await recaptchaRef.current?.executeAsync();
    //   if (token) {
    //     const apiQuery: any = await fetch(`/api/auth/verify-captcha/${token}`, {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     });
    //     const { success } = await apiQuery.json();
    //     if (success) {
    //       // toast.success("Form submitted successfully");
    //     } else {
    //       // toast.error("Form submission failed");
    //     }
    //   } else {
    //     // toast.error("Error getting token");
    //   }
    // } catch (error) {
    //   // toast.error("Failed to verify captcha");
    // }

    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });
    console.log("🚀 ~ onSubmit ~ result:", result);
    if (result?.status !== 200) {
      setToggle(!toggle);

      setAuthError("Incorrect credentials please try again!");
    } else {
      router.push("/");
      setToggle(toggle);
    }
    setIsLoading(false);
  }

  // CAPTCHA VERIFICATION
  const recaptchaRef: any = createRef();

  const onChange = () => {
    // on captcha change
  };

  const asyncScriptOnLoad = () => {
    // console.log("Google recaptcha loaded just fine");
  };

  return (
    <div className=" w-full flex items-start justify-center bg-vintage-50 h-screen overflow-hidden ">
      <div className=" w-full bg-[#F8F8F8]  h-svh  flex flex-col items-center justify-center rounded-xl p-8 py-8  2xl:p-10 ">
        <div className=" w-fit bg-white p-12 rounded-3xl shadow-sm max-h-[90svh] overflow-y-auto [scrollbar-width:none] scroll-smooth  ">
          <h2 className=" text-2xl md:text-3xl font-bold text-vintage-50 mb-2">
            Sign In
          </h2>
          <p className=" max-w-md  text-[#3E4347] text-[0.8rem] 2xl:text-[0.9rem] leading-loose font-light">
            Enter your email and password to access your account.
          </p>

          <Form {...form}>
            <div
              id="first"
              className="flex flex-col  items-center justify-center w-full gap-6 md:gap-4  mt-6"
            >
              <form onSubmit={form.handleSubmit(onSubmit)} className=" w-full ">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mb-4 w-full">
                      <FormLabel className="block text-[0.7rem] 2xl:text-[0.75rem] ml-6 text-[#3E4347] -mb-[1.1rem]  w-fit  ">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          {...field}
                          className="  border border-[#001E451A] mr-0 md:mr-6   rounded-full  w-full p-4  py-6  2xl:py-7 2xl:px-6 text-[#3E4347] leading-tight "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="mb-4 w-full">
                      <FormLabel className="block text-[0.7rem] 2xl:text-[0.75rem] ml-6 text-[#3E4347] -mb-[1.1rem]  w-fit  ">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          type="password"
                          {...field}
                          className="  border border-[#001E451A] mr-0 md:mr-6   rounded-full  w-full p-4  py-6  2xl:py-7 2xl:px-6 text-[#3E4347] leading-tight "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className=" w-full flex  justify-end pt-1 pb-3">
                  {!toggle ? (
                    <Link
                      href={"/login/reset-password"}
                      className="text-xs 2xl:text-sm text-gray-700 ml-auto font-thin leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Forgot password?{"  "}
                      <span className="text-vintage-50 font-bold pl-1">
                        Reset it
                      </span>
                      .
                    </Link>
                  ) : (
                    <p className="text-xs inline-flex w-full bg-[#F74418]/15 rounded-xl gap-3 border border-[#F74418]/20 py-2 px-3 items-center 2xl:text-sm text-[#F74418] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      <Image
                        src="/icons/alert.svg"
                        alt="line"
                        width={20}
                        height={20}
                        className=""
                      />
                      <span className=" text-[#F74418]">{AuthError}</span>
                    </p>
                  )}
                </div>

                {/* <ReCAPTCHA
                ref={recaptchaRef}
                size="invisible"
                sitekey="6LeQr1wqAAAAABFdff9ZpBeE5iAaeC89vV1TRWJP"
                onChange={onChange}
                asyncScriptOnLoad={asyncScriptOnLoad}
              /> */}

                <div className="flex flex-col w-full mt-2 items-center justify-center">
                  <Button
                    type="submit"
                    className="bg-vintage-50 mb-4  border  w-full rounded-full  text-white font-semibold py-6 2xl:py-8 px-10 2xl:text-lg   focus:outline-none focus:shadow-outline"
                  >
                    {isLoading ? (
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
                      <span className=" capitalize">LOG IN</span>
                    )}
                  </Button>
                  <h2 className="text-sm font-bold text-[#3E4347]">
                    New to VintagePicks?{" "}
                  </h2>
                  <Link
                    href={"/signup"}
                    className="text-vintage-50 font-bold text-sm mt-6"
                  >
                    <span className=" capitalize">Sign Up</span>
                  </Link>
                </div>
              </form>
            </div>
          </Form>
        </div>
      </div>
      <div className="hidden md:flex h-svh  flex-col items-center justify-center object-cover object-center   w-full  ">
        <Image
          src="/vintage/images/loginHero.svg"
          alt="signup"
          className=" w-full h-full object-cover object-bottom"
          width={400}
          height={400}
        />
      </div>
    </div>
  );
};

export default page;
