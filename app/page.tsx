import type {Metadata} from "next";
import SitePage from "./site-page";
import {metaFor} from "./site-meta";
const m=metaFor("/");
export const metadata:Metadata={title:m.title,description:m.description,alternates:{canonical:"/"},openGraph:{title:m.title,description:m.description,url:"/"}};
export default function Home(){return <SitePage path="/"/>}
