import type {Metadata} from "next";
import SitePage from "../site-page";
import {NOINDEX,PAGES,metaFor} from "../site-meta";
export function generateStaticParams(){return Object.keys(PAGES).filter(p=>p!=="/").map(p=>({slug:p.slice(1).split("/")}))}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}):Promise<Metadata>{
  const {slug}=await params;const path=`/${slug.join("/")}`;const m=metaFor(path);
  // Unknown routes and the still-placeholder legal pages stay out of the index.
  const hide=!(path in PAGES)||NOINDEX.has(path);
  return{title:m.title,description:m.description,alternates:{canonical:path},openGraph:{title:m.title,description:m.description,url:path},robots:hide?{index:false,follow:true}:undefined};
}
export default async function Page({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;return <SitePage path={`/${slug.join("/")}`}/>}
