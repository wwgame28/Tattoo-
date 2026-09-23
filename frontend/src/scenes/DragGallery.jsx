import {useRef,useState} from 'react';
import {motion,useDragControls} from 'motion/react';
import {DraggableCard} from '../components/aceternity/draggable-card';
import {Button} from '../components/ui/button';
import {RotateCcw,ArrowUpRight,Move} from 'lucide-react';
import {works} from '../data';
import {asset} from '../lib/utils';
import {Link} from '../router';
export default function DragGallery(){const viewport=useRef();const controls=useDragControls();const[key,setKey]=useState(0);return <><div className="drag-toolbar"><span><Move size={17}/> ПЕРЕТАЩИ ФОТО ИЛИ ФОН</span><Button variant="ghost" onClick={()=>setKey(x=>x+1)}><RotateCcw size={16}/> Сначала</Button></div><div className="drag-viewport" ref={viewport} key={key}><motion.div className="drag-plane" drag dragControls={controls} dragListener={false} dragConstraints={{left:-750,right:80,top:-250,bottom:60}} dragElastic={.12} onPointerDown={e=>{if(e.target.closest('.draggable-card'))return;controls.start(e)}}><div className="drag-type" aria-hidden="true">ТВОЯ<br/><i>композиция.</i></div>{works.slice(0,5).map((w,i)=><DraggableCard key={w.slug} dragConstraints={{left:-150,right:170,top:-120,bottom:130}} style={{left:[45,290,555,795,1010][i],top:[95,260,55,230,85][i],rotate:[-8,7,-5,9,-7][i]}}><img src={asset(`assets/works/${w.image.replace('.webp','-480.webp')}`)} alt={w.title} draggable="false" width="480" height="640" loading="lazy"/><Link to={`/works/${w.slug}`} onPointerDown={e=>e.stopPropagation()}>{w.number} / СМОТРЕТЬ <ArrowUpRight size={17}/></Link></DraggableCard>)}</motion.div></div><p className="drag-instruction">Меняй композицию как хочется. Открой работу кнопкой под фотографией.</p></>}
