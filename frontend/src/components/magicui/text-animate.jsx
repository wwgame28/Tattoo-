// Magic UI Text Animate pattern, adapted to mask reveals and Cyrillic typography.
import { motion,useReducedMotion } from 'motion/react';
export function TextAnimate({children,className='',as:Tag='h1'}){const reduced=useReducedMotion();return <Tag className={className} aria-label={children}>{children.split(' ').map((word,i)=><span className="word-mask" aria-hidden="true" key={i}><motion.span initial={reduced?false:{y:'105%'}} whileInView={{y:0}} viewport={{once:true}} transition={{duration:.75,delay:i*.05,ease:[.22,1,.36,1]}}>{word}&nbsp;</motion.span></span>)}</Tag>}
