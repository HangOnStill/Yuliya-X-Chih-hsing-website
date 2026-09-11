"use client";
import {Mail,Images,Sparkles,CalendarHeart,LockKeyhole,MapPinned,BookHeart,Settings2,Heart,X,PanelLeftClose,PanelLeftOpen,Smile} from 'lucide-react';
import {Sidebar,SidebarContent,SidebarHeader,SidebarFooter,SidebarMenu,SidebarMenuItem,SidebarMenuButton,useSidebar} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';

const items=[
 ['letter','Love letter','情書',Mail],
 ['memories','Memories','記憶庫',Images],
 ['keepsakes','Keepsakes','紀念冊與備份',BookHeart],
 ['wishes','Wishes','願望',Sparkles],
 ['poetry','Our poetry','詩詞庫',BookHeart],
 ['nicknames','Our nicknames','暱稱小本',Smile],
 ['plan','Our next year','生活計畫',CalendarHeart],
 ['capsules','Future letters','給未來的信',LockKeyhole],
 ['timeline','Our places','相遇地圖',MapPinned],
] as const;

export function GiftSidebarToggle(){
 const {open,openMobile,isMobile,toggleSidebar}=useSidebar();
 const expanded=isMobile?openMobile:open;
 const label=expanded?'Hide sidebar · 隱藏側欄':'Show sidebar · 顯示側欄';
 return <Button id="gift-navigation-toggle" className="gift-sidebar-toggle" variant="outline" onClick={toggleSidebar} aria-expanded={expanded} aria-controls="gift-navigation" aria-label={label} title={label+' (Ctrl / ⌘ + B)'}>{expanded?<PanelLeftClose aria-hidden="true"/>:<PanelLeftOpen aria-hidden="true"/>}<span>{isMobile?'選單':expanded?'隱藏側欄':'顯示側欄'}</span></Button>;
}

export default function GiftSidebar({tab,navigate,settings}:{tab:string;navigate:(tab:string)=>void;settings:()=>void}){
 const {setOpen,setOpenMobile,isMobile}=useSidebar();
 function go(id:string){navigate(id);setOpenMobile(false);}
 function hide(){if(isMobile)setOpenMobile(false);else{setOpen(false);document.getElementById('gift-navigation-toggle')?.focus();}}
 return <Sidebar className="gift-sidebar" collapsible="offcanvas">
  <SidebarHeader><div className="sidebar-brand"><button onClick={()=>go('letter')} aria-label="Our love letter">Y<span>♥</span>C</button><Button size="icon" variant="ghost" className="sidebar-hide" aria-label="Hide sidebar · 隱藏側欄" title="Hide sidebar · 隱藏側欄" onClick={hide}>{isMobile?<X/>:<PanelLeftClose/>}</Button></div><p>Yuliya × Chih-hsing</p></SidebarHeader>
  <SidebarContent id="gift-navigation"><SidebarMenu aria-label="Our world">{items.map(([id,en,zh,Icon])=><SidebarMenuItem key={id}><SidebarMenuButton onClick={()=>go(id)} isActive={tab===id} aria-current={tab===id?'page':undefined}><Icon/><span>{en}<small lang="zh-Hant">{zh}</small></span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent>
  <SidebarFooter><SidebarMenuButton onClick={()=>{setOpenMobile(false);settings();}}><Settings2/><span>Letter settings <small>情書設定</small></span></SidebarMenuButton><p className="sidebar-whisper"><Heart size={12}/> To be continued, together.</p></SidebarFooter>
 </Sidebar>;
}
