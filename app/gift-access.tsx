"use client";
import {createContext,useContext,type ComponentProps} from 'react';
import {Button} from '@/components/ui/button';
export const GiftAccess=createContext(false);
export function useCanEdit(){return useContext(GiftAccess);}
export function EditButton(props:ComponentProps<typeof Button>){const allowed=useCanEdit();return allowed?<Button {...props}/>:null;}
