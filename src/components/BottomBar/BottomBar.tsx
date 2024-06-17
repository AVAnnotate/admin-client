import './BottomBar.css';

interface BottomBarProps {
  children: any;
}

export const BottomBar = (props: BottomBarProps) => {
  return (
    <div className='bottom-bar-container'>
      <footer className='container bottom-bar'>{props.children}</footer>
    </div>
  );
};
