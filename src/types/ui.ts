export interface MeatballMenuItem {
  label: string;
  onClick: (item: any) => any;
  icon?: React.FC<any>;
}
