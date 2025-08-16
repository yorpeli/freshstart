import Card from '../ui/Card';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  action, 
  icon,
  className = ''
}) => {
  return (
    <div className={className}>
      <Card className="text-center py-12">
        {icon && <div className="text-gray-400 mb-4">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {action}
      </Card>
    </div>
  );
};

export default EmptyState;