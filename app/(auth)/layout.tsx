import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full  bg-vintage-default h-screen ">{children}</div>;
};

export default Layout;
