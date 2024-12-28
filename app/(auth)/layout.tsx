import React from "react";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="relative flex min-h-screen">

            <div className="absolute left-4 top-4 z-10">
                <Image
                    src="/assets/images/2.png"
                    alt="logo"
                    width={130}
                    height={100}
                    // className="h-auto w-auto"
                />
            </div>

            {/* Left section with a responsive background */}
            <section
                className="hidden w-1/2 items-center justify-center bg-brand bg-[url('/assets/images/background-left.png')] bg-fixed bg-left p-10 lg:flex xl:w-2/5"
            >
                <div className="flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-12">


                    <div className="space-y-5 text-white">
                        <h1 className="h1">Drop it, Store it, Access it—Anywhere, Anytime!</h1>
                        <p className="body-1 text-center">Store your documents safely</p>
                    </div>
                </div>
            </section>

            {/* Right section with a responsive background */}
            <section
                className="flex flex-1 flex-col items-center bg-white bg-[url('/assets/images/background-right.jpg')] bg-cover bg-center p-4 py-10 lg:justify-center lg:p-10 lg:py-0"
            >
                {children}
            </section>
        </div>
    );
};
export default Layout;
