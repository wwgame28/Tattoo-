import * as A from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
export const Accordion=A.Root;
export function AccordionItem({value,title,children}){return <A.Item value={value} className="accordion-item"><A.Header><A.Trigger className="accordion-trigger">{title}<Plus size={23}/></A.Trigger></A.Header><A.Content className="accordion-content"><div>{children}</div></A.Content></A.Item>}
