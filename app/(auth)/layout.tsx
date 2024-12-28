import React from "react";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen">
            <div className="absolute top-4 left-4 z-10">
                <Image
                    src="/assets/images/2.png"
                    alt="illustration"
                    width={130}
                    height={130}
                    className="transition-all hover:rotate-2 hover:scale-105 hidden lg:block"
                />
            </div>


            {/* Left section with a background image */}
            <section
                className="hidden w-1/2 items-center justify-center bg-brand p-10 lg:flex xl:w-2/5 bg-[url('/assets/images/background-left.png')] bg-fixed bg-left"
            >
                <div className="flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-12">


                    <div className="space-y-5 text-white">
                        <h1 className="h1">Drop it, Store it, Access it—Anywhere, Anytime!</h1>
                        <p className="body-1 text-center">Store your documents safely</p>
                    </div>
                </div>
            </section>

            {/* Right section with a background image */}
            <section
                className="flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0 bg-[url('/assets/images/background-right.jpg')] bg-cover bg-center"
            >
                <div className="mb-16 lg:hidden">
                    <Image
                        src="/assets/images/Logo-full.png"
                        alt="logo"
                        width={200}
                        height={50}
                        className="h-auto w-[200px] lg:w-[250px]"
                    />
                </div>
                {children}
            </section>
        </div>
    );
};
export default Layout;
