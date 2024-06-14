export interface MeatballMenuItem {
  label: string;
  onClick: (item: any) => any | Promise<any>;
  icon?: React.FC<any>;
}
