// shadcn/ui Button, adapted to ORLICA's editorial tokens (MIT).
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
const variants=cva('button',{variants:{variant:{default:'button-solid',outline:'button-outline',ghost:'button-ghost'},size:{default:'',icon:'button-icon'}},defaultVariants:{variant:'default',size:'default'}});
export const Button=React.forwardRef(({className,variant,size,asChild=false,...props},ref)=>{const Comp=asChild?Slot:'button';return <Comp ref={ref} className={cn(variants({variant,size}),className)} {...props}/>});
Button.displayName='Button';
