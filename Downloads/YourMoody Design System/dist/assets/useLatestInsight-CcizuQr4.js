import{c as f,u as d,s as h}from"./index-DdXr5ocJ.js";import{a as s}from"./react-vendor-ChA6AZcE.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]],m=f("trending-up",g);function _(){const{user:t}=d(),[c,r]=s.useState(null),[l,n]=s.useState(!0),[u,a]=s.useState(null),i=async()=>{if(!t){r(null),n(!1);return}try{n(!0),a(null);const{data:e,error:o}=await h.from("ai_insights").select("*").eq("user_id",t.id).order("created_at",{ascending:!1}).limit(1);if(o)throw o;r(e&&e.length>0?e[0]:null)}catch(e){a(e)}finally{n(!1)}};return s.useEffect(()=>{i()},[t==null?void 0:t.id]),{insight:c,loading:l,error:u,refetch:i}}export{m as T,_ as u};
