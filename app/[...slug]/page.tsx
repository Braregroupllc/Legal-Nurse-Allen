import type {Metadata} from "next";
import SitePage from "../site-page";
import {NOINDEX,PAGES,metaFor} from "../site-meta";
// Only the known routes are built; anything else 404s.
export const dynamicParams=false;
export function generateStaticParams(){return Object.keys(PAGES).filter(p=>p!=="/").map(p=>({slug:p.slice(1).split("/")}))}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}):Promise<Metadata>{
  const {slug}=await params;const path=`/${slug.join("/")}`;const m=metaFor(path);
  // The legal pages are still placeholder text, so keep them out of the index.
  const hide=NOINDEX.has(path);
  return{title:m.title,description:m.description,alternates:{canonical:path},openGraph:{title:m.title,description:m.description,url:path},robots:hide?{index:false,follow:true}:undefined};
}
export default async function Page({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;return <SitePage path={`/${slug.join("/")}`}/>}
