// Magic UI Text Animate pattern, adapted to mask reveals and Cyrillic typography.
import {useRef} from 'react';
import {motion,useInView,useReducedMotion} from 'motion/react';
export function TextAnimate({children,className='',as:Tag='h1'}){const ref=useRef(null);const seen=useInView(ref,{once:true,amount:.1});const reduced=useReducedMotion();return <Tag ref={ref} className={className} aria-label={children}>{children.split(' ').map((word,i)=><span className="word-mask" aria-hidden="true" key={i}><motion.span initial={reduced?false:{y:'105%'}} animate={seen||reduced?{y:0}:{y:'105%'}} transition={{duration:reduced?0:.75,delay:reduced?0:i*.05,ease:[.22,1,.36,1]}}>{word}&nbsp;</motion.span></span>)}</Tag>}
