import {createContext,useContext,useEffect,useState,useCallback} from 'react';
import {flushSync} from 'react-dom';
const RouterContext=createContext(null);
const base=import.meta.env.BASE_URL.replace(/\/$/,'');
const pathNow=()=>{let p=location.pathname;if(base&&p.startsWith(base))p=p.slice(base.length);return p.replace(/\/index.html$/,'').replace(/\/$/,'')||'/'};
export function Router({children}){const[path,setPath]=useState(pathNow);const[transitioning,setTransitioning]=useState(false);
useEffect(()=>{const change=()=>{setPath(pathNow());window.scrollTo(0,0)};window.addEventListener('popstate',change);return()=>window.removeEventListener('popstate',change)},[]);
const navigate=useCallback((to,{image}={})=>{if(to===pathNow())return;const update=()=>{history.pushState({},'',`${base}${to==='/'?'/':to}`);flushSync(()=>setPath(to));window.scrollTo({top:0,behavior:'instant'});document.querySelector('main')?.focus({preventScroll:true});};const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(document.startViewTransition&&!reduced){document.documentElement.dataset.shared=image||'';document.startViewTransition(update).finished.finally(()=>{delete document.documentElement.dataset.shared});}else if(!reduced){setTransitioning(true);setTimeout(()=>{update();setTimeout(()=>setTransitioning(false),260)},230)}else update();},[]);
return <RouterContext.Provider value={{path,navigate}}>{children}<div className={`page-curtain ${transitioning?'active':''}`} aria-hidden="true"/></RouterContext.Provider>}
export const useRouter=()=>useContext(RouterContext);
export function Link({to,children,onClick,shared,...props}){const{navigate}=useRouter();return <a href={`${base}${to==='/'?'/':to}`} onClick={e=>{onClick?.(e);if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();navigate(to,{image:shared});}} {...props}>{children}</a>}
