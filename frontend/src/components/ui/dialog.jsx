// shadcn/ui Dialog primitives, adapted visual surface (MIT).
import * as D from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
export const Dialog=D.Root,DialogTrigger=D.Trigger,DialogTitle=D.Title,DialogDescription=D.Description,DialogClose=D.Close;
export function DialogContent({children,className='',...props}){return <D.Portal><D.Overlay className="dialog-overlay"/><D.Content className={`dialog-content ${className}`} {...props}>{children}<D.Close className="dialog-close" aria-label="Закрыть"><X size={26}/></D.Close></D.Content></D.Portal>}
