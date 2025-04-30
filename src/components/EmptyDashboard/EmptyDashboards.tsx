import './EmptyDashboard.css';

interface EmptyDashboardProps {
  description: string;
  children: any;
}
export const EmptyDashboard = (props: EmptyDashboardProps) => {
  return (
    <div className='empty-dashboard-container'>
      <div className='empty-dashboard-label'>{props.description}</div>
      <div className='empty-dashboard-actions'>{props.children}</div>
    </div>
  );
};
