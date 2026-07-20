import {
  importCategoriesAll, importTagsAll, importMediaPage,
  importPostsPage, importCustomPostType, importPagesPage,
} from "/dev-server/src/lib/wp/wp-import.server.ts";
import { createClient } from "@supabase/supabase-js";

async function main() {
  try { console.log("categories:", await importCategoriesAll()); } catch(e){ console.error("categories ERR",e); }
  try { console.log("tags:", await importTagsAll()); } catch(e){ console.error("tags ERR",e); }
  try { console.log("media:", await importMediaPage(1,5)); } catch(e){ console.error("media ERR",e); }
  try { console.log("posts:", await importPostsPage(1,3,"publish")); } catch(e){ console.error("posts ERR",e); }
  try { console.log("movies:", await importCustomPostType("movie",1,3,"publish")); } catch(e){ console.error("movies ERR",e); }
  try { console.log("pages:", await importPagesPage(1,3,"publish")); } catch(e){ console.error("pages ERR",e); }

  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const queries: [string, any][] = [
    ["categories", await sb.from("categories").select("*",{count:"exact",head:true})],
    ["tags", await sb.from("tags").select("*",{count:"exact",head:true})],
    ["media", await sb.from("media").select("*",{count:"exact",head:true})],
    ["posts", await sb.from("posts").select("*",{count:"exact",head:true})],
    ["posts movie", await sb.from("posts").select("*",{count:"exact",head:true}).eq("cpt_type","movie")],
    ["pages", await sb.from("pages").select("*",{count:"exact",head:true})],
    ["post_categories", await sb.from("post_categories").select("*",{count:"exact",head:true})],
  ];
  for (const [n,r] of queries) console.log("COUNT", n, "=", r.count, r.error?.message ?? "");
  console.log("sample post:", (await sb.from("posts").select("slug,cpt_type,content,cover_media_id,video_url").is("cpt_type",null).order("created_at",{ascending:false}).limit(1)).data?.map(p=>({...p,len:p.content?.length,content:undefined})));
  console.log("sample movie:", (await sb.from("posts").select("slug,video_url,content").eq("cpt_type","movie").limit(1)).data?.map(p=>({...p,len:p.content?.length,content:undefined})));
  console.log("sample media:", (await sb.from("media").select("wp_id,url,bucket,width,height").limit(1)).data);
}
main().catch(e=>{console.error("FATAL",e);process.exit(1)});
