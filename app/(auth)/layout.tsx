import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full  bg-vintage-default h-screen ">
      {/* <div className=" w-full pt-5 px-8">
        <Image
          priority
          src="/vintage/images/logo.svg"
          alt="logo"
          width={60}
          height={60}
        />
      </div> */}
      {children}
    </div>
  );
};

export default Layout;
