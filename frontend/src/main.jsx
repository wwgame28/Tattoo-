import React,{Suspense,lazy,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {MotionConfig} from 'motion/react';
import {Router,useRouter} from './router';
import {Layout} from './components/Layout';
import {Home,Works,WorkDetail,About,Prices,Process,Faq,NotFound} from './pages';
import './fonts.css';
import './styles.css';
const Booking=lazy(()=>import('./scenes/Booking'));
function App(){const{path}=useRouter();useEffect(()=>{const titles={'/':'Татуировки Светы','/works':'Работы','/prices':'Стоимость','/about':'Света','/process':'Процесс','/faq':'Вопросы','/booking':'Запись'};document.title=`ОРЛИЦА — ${titles[path]||'История на коже'}`},[path]);let page;if(path==='/')page=<Home/>;else if(path==='/works')page=<Works/>;else if(path.startsWith('/works/'))page=<WorkDetail slug={path.split('/')[2]}/>;else if(path==='/about')page=<About/>;else if(path==='/prices')page=<Prices/>;else if(path==='/process')page=<Process/>;else if(path==='/faq')page=<Faq/>;else if(path==='/booking')page=<Suspense fallback={<div className="scene-loading">ТВОЯ ИДЕЯ.</div>}><Booking/></Suspense>;else page=<NotFound/>;return <MotionConfig reducedMotion="user"><Layout>{page}</Layout></MotionConfig>}
try{if(!sessionStorage.getItem('orlica-intro')){document.documentElement.dataset.intro='true';sessionStorage.setItem('orlica-intro','1');setTimeout(()=>delete document.documentElement.dataset.intro,1700)}}catch{}
createRoot(document.getElementById('root')).render(<Router><App/></Router>);
