import type {Metadata} from "next";import "./globals.css";import {ORGANIZATION_LD,SITE_NAME,SITE_URL,metaFor} from "./site-meta";
const home=metaFor("/");
// metaFor already returns fully-suffixed titles, so no title template here.
export const metadata:Metadata={metadataBase:new URL(SITE_URL),title:home.title,description:home.description,openGraph:{siteName:SITE_NAME,title:home.title,description:home.description,type:"website",url:SITE_URL},robots:{index:true,follow:true},icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ORGANIZATION_LD)}}/></body></html>}
