"use client";

import Link from "next/link";
import Image from "next/image";
import {avatarPlaceholderUrl, navItems} from "@/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
    fullName: string;
    email: string;
}

const Sidebar = ({ fullName, email }: Props) => {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <Link href="/">
                <Image
                    src="/assets/images/Logo-full.png"
                    alt="logo"
                    width={120}
                    height={50}
                    className="hidden lg:block"
                />

                <Image
                    src="/assets/images/Logo.png"
                    alt="logo"
                    width={52}
                    height={52}
                    className="lg:hidden"
                />
            </Link>

            <nav className="sidebar-nav">
                <ul className="flex flex-1 flex-col gap-6">
                    {navItems.map(({ url, name, icon }) => (
                        <Link key={name} href={url} className="lg:w-full">
                            <li
                                className={cn(
                                    "sidebar-nav-item",
                                    pathname === url && "shad-active",
                                )}
                            >
                                <Image
                                    src={icon}
                                    alt={name}
                                    width={24}
                                    height={24}
                                    className={cn(
                                        "nav-icon",
                                        pathname === url && "nav-icon-active",
                                    )}
                                />
                                <p className="hidden lg:block">{name}</p>
                            </li>
                        </Link>
                    ))}
                </ul>
            </nav>
            <div className="sidebar-user-info">
                <Image
                    src={avatarPlaceholderUrl}
                    alt="Avatar"
                    width={60}
                    height={60}
                    className="sidebar-user-avatar"
                />
                <div className="hidden lg:block">
                    <p className="subtitle-2 capitalize">{fullName}</p>
                    <p className="caption">{email}</p>
                </div>
            </div>
        </aside>
    );
};
export default Sidebar;