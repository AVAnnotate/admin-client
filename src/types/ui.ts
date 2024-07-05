import type { Translations } from "./Types.ts";

export interface MeatballMenuItem {
  label: string;
  onClick: (item: any) => any | Promise<any>;
  icon?: React.FC<any>;
}

export interface DraggedPage {
  uuid: string;
  originalIndex: number;
  hoverIndex: number;
}

export interface SlateButtonProps {
  format: string;
  icon: React.FC;
}

export interface SlateDialogProps extends SlateButtonProps {
  i18n: Translations;
  title: string;
}