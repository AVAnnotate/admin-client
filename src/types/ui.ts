export interface MeatballMenuItem {
  label: string;
  onClick: (...args: any) => any;
  icon?: React.FC<any>;
}
