// Aceternity UI Draggable Card interaction adapted for a flat editorial photo table.
import {motion,useMotionValue,useTransform,useReducedMotion} from 'motion/react';
export function DraggableCard({children,className='',style={},...props}){const reduced=useReducedMotion();const x=useMotionValue(0);const rotate=useTransform(x,[-500,500],[-4,4]);return <motion.div className={`draggable-card ${className}`} drag dragElastic={.14} dragMomentum={!reduced} whileDrag={{scale:reduced?1:1.035,zIndex:20,rotate:0}} style={{x,rotate:reduced?0:rotate,...style}} {...props}>{children}</motion.div>}
