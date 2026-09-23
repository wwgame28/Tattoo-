// Adapted from Magic UI Blur Fade (MIT): restrained distance/blur and reduced motion.
import { useRef } from 'react';
import { motion,useInView,useReducedMotion } from 'motion/react';
export function BlurFade({children,className='',delay=0,duration=.65,inView=true}){const ref=useRef(null);const seen=useInView(ref,{once:true,margin:'-30px'});const reduced=useReducedMotion();return <motion.div ref={ref} className={className} initial={reduced?false:{opacity:0,y:18,filter:'blur(3px)'}} animate={!inView||seen?{opacity:1,y:0,filter:'blur(0px)'}:{}} transition={{duration:reduced?0:duration,delay,ease:[.22,1,.36,1]}}>{children}</motion.div>}
