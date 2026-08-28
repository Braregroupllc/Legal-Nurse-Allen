import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"Allen Legal Nurse Consultants",description:"Clinical intelligence for litigation. Complex medical records transformed into organized, attorney-ready insight.",openGraph:{title:"Allen Legal Nurse Consultants",description:"Complex medical records. Clear litigation leverage.",type:"website"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
