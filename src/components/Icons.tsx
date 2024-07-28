import { LucideProps, UserPlus } from "lucide-react";
import Image from "next/image";

export const Icons = {
    Logo: (props: LucideProps)=> (
        <Image
        src={'./logo.svg'}
        alt="logo"
        width={100}
        height={100}
        className="w-10 h-10 "
        />
    ),
    UserPlus
}

export type Icon = keyof typeof Icons