import { NextRequest } from 'next/server';
import { getBackend, forwardCookies, handleAdminResponse } from '../../../admin/_lib';
export async function GET(req: NextRequest, {params}: {params: Promise<{id:string}>}) {
  const {id}=await params;
  const res=await fetch(getBackend()+'/api/checkout/'+id+'/public',forwardCookies(req,{cache:'no-store'}));
  return handleAdminResponse(res,await res.json().catch(()=>({ok:false})));
}
