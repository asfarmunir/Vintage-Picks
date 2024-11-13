"use client";
import Image from "next/image";
import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import axios from "axios";
import { accountStore } from "@/app/store/account";
import { userStore } from "@/app/store/user";

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: "First name should be atleast 2 characters",
    })
    .optional(),
  lastName: z
    .string()
    .min(2, {
      message: "Last name should be atleast 2 characters",
    })
    .optional(),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address",
    })
    .optional(),

  phone: z
    .string()
    .optional(),
  address: z
    .string()
    .optional(),
  // dateOfBirth: z
  //   .string()
  //   .min(2, {
  //     message: "Please enter a valid date of birth",
  //   })
  //   .optional(),
});

const passFormSchema = z.object({
  password: z
    .string()
    .min(8, {
      message: "Password should be atleast 8 characters",
    })
    .optional(),
  confirmPassword: z
    .string()
    .min(8, {
      message: "Please enter password again",
    })
    .optional(),
})

const GeneralSettings = () => {
  const updateUser = userStore((state) => state.setUser);
  const { status, data: session }: any = useSession();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: session?.user?.email || undefined,
      firstName: session?.user?.firstName || undefined,
      lastName: session?.user?.lastName || undefined,
      phone: session?.user?.phoneNumber || undefined,
      address: session?.user?.address || undefined,
      dateOfBirth: session?.user?.dateOfBirth || undefined,
    },
  });

  const passForm = useForm({
    resolver: zodResolver(passFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    }
  })

  async function onSubmit(values: any) {
    try {
      // const formattedDate = new Date(values.dateOfBirth)
      //   .toISOString()
      //   .split("T")[0];

      const userData = {
        id: session?.user?.id,
        firstName: values.firstName,
        lastName: values.lastName,
        // email: values.email,
        phone: values.phone,
        address: values.address,
        // dateOfBirth: formattedDate,
        password: values.password !== "password" ? values.password : undefined,
      };

      const response = await axios.patch(
        `/api/general-setting`,
        userData
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        updateUser(response.data.user)
      } else {
        console.error("Failed to update user", response);
        toast.error("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while updating your profile.");
    }
  }

  async function changePassword(values: any) {
    try {
      const response = await axios.patch(
        `/api/general-setting`,
        {
          id: session?.user?.id,
          ...values
        }
      );

      if (response.status === 200) {
        toast.success("Password updated successfully!");
      } else {
        console.error("Failed to update user", response);
        toast.error("Failed to update password. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while updating your password.");
    }
  }

  return (
    <div className="flex flex-col  gap-4 my-6  w-full  ">
      <Form {...form}>
        <div
          id="first"
          className="flex flex-col  items-center justify-center w-full gap-6 md:gap-4  "
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mb-4 w-full">
                    <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        placeholder="enter your email"
                        {...field}
                        className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight disabled:opacity-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-2 md:gap-4">
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
                name="address"
                render={({ field }) => (
                  <FormItem className="mb-4 w-full">
                    <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                      Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder=" enter your address"
                        {...field}
                        className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="mb-4 w-full">
                    <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                      Date of Birth
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="YYYY-MM-DD"
                        {...field}
                        className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>
            <Button
              type="submit"
              className="bg-[#333547] inner-shadow border w-full md:w-fit border-[#28B601]  rounded-xl hover:bg-slate-600 mt-4 text-white font-semibold p-6  2xl:text-lg   focus:outline-none focus:shadow-outline"
            >
              <span className=" capitalize">Save Changes</span>
            </Button>
          </form>
        </div>
      </Form>
      <hr className="border-gray-700 my-6" />
      <Form {...passForm} >

        <form className="flex flex-col md:flex-row items-center justify-between w-full gap-2 md:gap-4"
          onSubmit={passForm.handleSubmit(changePassword)}
        >
          <FormField
            control={passForm.control}
            name="password"
            render={({ field }) => (
              <FormItem className="mb-4 w-full">
                <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your password"
                    {...field}
                    type="password"
                    className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="mb-4 w-full">
                <FormLabel className="block 2xl:text-[1.05rem] text-gray-300  mb-2.5">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Re-enter your password"
                    type="password"
                    {...field}
                    className="  focus:ring-green-600/50 focus:ring-1 outline-offset-1  shadow  focus:border mr-0 md:mr-6  rounded-lg bg-[#333547]/60 w-full p-4  2xl:py-6 2xl:px-6 text-[#848BAC] leading-tight "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="bg-[#333547] inner-shadow border w-full md:w-fit border-[#28B601]  rounded-xl hover:bg-slate-600 mt-4 text-white font-semibold p-6  2xl:text-lg   focus:outline-none focus:shadow-outline"
          >
            {/* {isLoading ? (
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
                        ) : ( */}
            <span className=" capitalize">RESET</span>
            {/* )} */}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default GeneralSettings;
