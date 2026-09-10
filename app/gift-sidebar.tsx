"use client";
import {Mail,Images,Sparkles,CalendarHeart,LockKeyhole,MapPinned,BookHeart,Settings2,Heart,X} from 'lucide-react';
import {Sidebar,SidebarContent,SidebarHeader,SidebarFooter,SidebarMenu,SidebarMenuItem,SidebarMenuButton,useSidebar} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
const items=[['letter','Love letter','情書',Mail],['memories','Memories','記憶庫',Images],['wishes','Wishes','願望',Sparkles],['plan','Our next year','生活計畫',CalendarHeart],['capsules','Future letters','給未來的信',LockKeyhole],['timeline','Our places','相遇地圖',MapPinned],['keepsakes','Keepsakes','紀念冊與備份',BookHeart]] as const;
export default function GiftSidebar({tab,navigate,settings}:{tab:string;navigate:(tab:string)=>void;settings:()=>void}){
 const {setOpenMobile,isMobile}=useSidebar();
 function go(id:string){navigate(id);setOpenMobile(false);}
 return <Sidebar className="gift-sidebar"><SidebarHeader><div className="sidebar-brand"><button onClick={()=>go('letter')} aria-label="Our love letter">Y<span>❤</span>C</button>{isMobile&&<Button size="icon" variant="ghost" aria-label="Close navigation" onClick={()=>setOpenMobile(false)}><X/></Button>}</div><p>Yuliya × Chih-hsing</p></SidebarHeader><SidebarContent><SidebarMenu aria-label="Our world">{items.map(([id,en,zh,Icon])=><SidebarMenuItem key={id}><SidebarMenuButton onClick={()=>go(id)} isActive={tab===id} aria-current={tab===id?'page':undefined}><Icon/><span>{en}<small lang="zh-Hant">{zh}</small></span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter><SidebarMenuButton onClick={()=>{setOpenMobile(false);settings();}}><Settings2/><span>Letter settings <small>情書設定</small></span></SidebarMenuButton><p className="sidebar-whisper"><Heart size={12}/> To be continued, together.</p></SidebarFooter></Sidebar>;
}
