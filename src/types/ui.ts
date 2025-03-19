import type { BaseEditor } from 'slate';
import type { ReactEditor } from 'slate-react';

export interface MeatballMenuItem {
  hasSubmenus?: boolean;
  label: string;
  onClick: (item: any) => any | Promise<any>;
  icon?: React.FC<any>;
  displayCondition?: (row: any) => boolean;
  children?: MeatballMenuItem[];
  id?: string;
}

export interface DraggedPage {
  uuid: string;
  originalIndex: number;
  hoverIndex: number;
}

export interface SlateButtonProps {
  format: string;
  icon: React.FC;
  onInsert?: (editor: BaseEditor & ReactEditor) => void;
}
